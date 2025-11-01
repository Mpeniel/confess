// src/hooks/useSpeechCounter.ts
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

type Mode = "exact" | "contains" | "fuzzy";

export type SpeechCounterOptions = {
  language?: string;
  mode?: Mode;
  maxFuzzyRatio?: number;
  slackWords?: number;
  silenceMs?: number;
  autoRestartDelayMs?: number;
  minWordsRatio?: number;
  minWordsAbsolute?: number;
};

export type SpeechCounterResult = {
  transcript: string;
  listening: boolean;
  count: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  browserSupportsSpeechRecognition: boolean;
};

function getSR(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function normalize(s: string): string {
  const lower = s.toLowerCase();
  const noDiacritics = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noDiacritics.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function toWords(s: string): string[] {
  const n = normalize(s);
  return n ? n.split(" ") : [];
}

function countContainsOccurrences(textNorm: string, targetNorm: string): number {
  if (!textNorm || !targetNorm) return 0;
  const escaped = targetNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, "g");
  return (textNorm.match(re) || []).length;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

function fuzzyWindowHit(textNorm: string, targetNorm: string, slackWords: number, maxRatio: number): boolean {
  const bufWords = toWords(textNorm);
  const tgtWords = toWords(targetNorm);
  if (!bufWords.length || !tgtWords.length) return false;

  const tgtJoin = tgtWords.join(" ");
  const tgtLen = tgtJoin.length || 1;

  const winMin = Math.max(1, tgtWords.length - slackWords);
  const winMax = tgtWords.length + slackWords;

  for (let w = winMin; w <= winMax; w++) {
    if (w > bufWords.length) break;
    for (let i = 0; i + w <= bufWords.length; i++) {
      const seg = bufWords.slice(i, i + w).join(" ");
      const d = levenshtein(seg, tgtJoin);
      const ratio = d / tgtLen;
      if (ratio <= maxRatio) return true;
    }
  }
  return false;
}

export function useSpeechCounter(
  targetPhrase?: string,
  {
    language = "fr-FR",
    mode = "contains",
    maxFuzzyRatio = 0.24,
    slackWords = 2,
    silenceMs = 1200,
    autoRestartDelayMs = 120,
    minWordsRatio = 0.6,
    minWordsAbsolute,
  }: SpeechCounterOptions = {}
): SpeechCounterResult {
  const [transcript, setTranscript] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const SR = getSR();
  const browserSupportsSpeechRecognition = SR !== null;
  const normTarget = targetPhrase ? normalize(targetPhrase) : "";

  const recRef = useRef<SpeechRecognition | null>(null);
  const runningRef = useRef<boolean>(false);
  const segmentRef = useRef<string>("");
  const silenceTimerRef = useRef<number | null>(null);

  const finalizeSegment = useCallback(() => {
    const seg = segmentRef.current.trim();
    if (!seg) return;

    setTranscript(prev => (prev ? `${prev} ${seg}` : seg));

    if (normTarget) {
      const normSeg = normalize(seg);
      const segWordsCount = toWords(normSeg).length;
      const targetWordsCount = toWords(normTarget).length;
      const minWordsByRatio = Math.ceil(targetWordsCount * minWordsRatio);
      const minWords = minWordsAbsolute != null
        ? Math.max(minWordsByRatio, minWordsAbsolute)
        : minWordsByRatio;

      let inc = 0;

      if (segWordsCount >= minWords) {
        if (mode === "exact") {
          if (segWordsCount === targetWordsCount && normSeg === normTarget) inc = 1;
        } else if (mode === "contains") {
          inc = countContainsOccurrences(normSeg, normTarget);
        } else {
          if (fuzzyWindowHit(normSeg, normTarget, slackWords, maxFuzzyRatio)) inc = 1;
        }
      }

      if (inc > 0) setCount(prev => prev + inc);
    }

    segmentRef.current = "";
  }, [mode, normTarget, slackWords, maxFuzzyRatio, minWordsRatio, minWordsAbsolute]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      finalizeSegment();
      silenceTimerRef.current = null;
    }, silenceMs) as unknown as number;
  }, [finalizeSegment, silenceMs]);

  const makeRecognizer = useCallback((): SpeechRecognition => {
    const rec = new (SR as new () => SpeechRecognition)();
    rec.lang = language;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);

    rec.onend = () => {
      setListening(false);
      if (runningRef.current) {
        window.setTimeout(() => {
          try {
            rec.start();
          } catch {
            if (runningRef.current) {
              recRef.current = makeRecognizer();
              recRef.current.start();
            }
          }
        }, autoRestartDelayMs);
      }
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      setError(`SpeechRecognition error: ${ev.error}`);
    };

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      armSilenceTimer();

      const { resultIndex, results } = ev;
      let liveAdded = "";
      for (let i = resultIndex; i < results.length; i++) {
        const res = results.item(i);
        if (!res) continue;
        liveAdded += (liveAdded ? " " : "") + res[0].transcript;
      }
      if (liveAdded) {
        segmentRef.current = liveAdded;
        let hasFinal = false;
        for (let i = resultIndex; i < results.length; i++) {
          const r = results.item(i);
          if (r?.isFinal) { hasFinal = true; break; }
        }
        if (hasFinal) {
          clearSilenceTimer();
          finalizeSegment();
        }
      }
    };

    return rec;
  }, [SR, language, armSilenceTimer, finalizeSegment, autoRestartDelayMs]);

  const start = useCallback(async () => {
    setError(null);

    if (!SR) {
      setError("Reconnaissance vocale non supportée sur ce navigateur.");
      return;
    }

    const isSecure =
      typeof window !== "undefined" &&
      (location.protocol === "https:" || location.hostname === "localhost");
    if (!isSecure) {
      setError("Le micro nécessite HTTPS (ou localhost).");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Permission micro refusée.");
      return;
    }

    runningRef.current = true;
    segmentRef.current = "";
    clearSilenceTimer();

    recRef.current = makeRecognizer();
    try {
      recRef.current.start();
    } catch (e) {
      setError(`Impossible de démarrer l’écoute: ${String(e)}`);
      setListening(false);
    }
  }, [SR, makeRecognizer]);

  const stop = useCallback(() => {
    runningRef.current = false;
    clearSilenceTimer();
    try { recRef.current?.stop(); } catch {
      // ignore
    }
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      clearSilenceTimer();
      try { recRef.current?.stop(); } catch {
        // ignore
      }
    };
  }, []);

  return {
    transcript,
    listening,
    count,
    error,
    start,
    stop,
    browserSupportsSpeechRecognition,
  };
}