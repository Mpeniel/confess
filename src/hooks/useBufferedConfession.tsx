// src/hooks/useBufferedConfession.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { anchorOrderMatch, fuzzyWindowMatch, normalize } from "../utils/text";

type Options = {
  language?: string;          // "fr-FR" par défaut
  maxBufferChars?: number;    // clamp du buffer
  slackWords?: number;        // fenêtre +/- autour de la cible
  maxFuzzyRatio?: number;     // seuil Levenshtein relatif
  anchors?: string[];         // stems en ordre
};

type StartResult = { ok: boolean; reason?: string };

export function useBufferedConfession(
  targetPhrase: string,
  opts: Options = {}
) {
  const {
    language = "fr-FR",
    maxBufferChars = 800,
    slackWords = 2,
    maxFuzzyRatio = 0.22,
    anchors = ["je", "suis", "mort", "ressuscit", "christ"],
  } = opts;

  // --- State & refs
  const [count, setCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const bufferRef = useRef<string>("");
  const recRef = useRef<SpeechRecognition | null>(null);
  const normTarget = normalize(targetPhrase);

  // --- Détection de support (Chrome desktop OK, Safari/iOS non)
  const SR =
    typeof window !== "undefined"
      ? window.webkitSpeechRecognition || window.SpeechRecognition
      : null;
  const browserSupportsSpeechRecognition = !!SR;

  // --- Consommation d'un match (ancres → fuzzy)
  const tryConsume = useCallback(() => {
    const buf = bufferRef.current;

    // 1) ancres rapides (ordre : je → suis → mort → ressuscit → christ)
    const a = anchorOrderMatch(buf, anchors);
    if (a?.ok) {
      bufferRef.current = normalize(buf).slice(a.consumeChars).trimStart();
      setCount((c) => c + 1);
      return true;
    }

    // 2) fuzzy fenêtre glissante (tolérance accent/variantes)
    const f = fuzzyWindowMatch(buf, normTarget, slackWords, maxFuzzyRatio);
    if (f?.ok) {
      bufferRef.current = normalize(buf).slice(f.consumeChars).trimStart();
      setCount((c) => c + 1);
      return true;
    }

    return false;
  }, [anchors, normTarget, slackWords, maxFuzzyRatio]);

  // --- START / STOP
  // start() DOIT être appelé depuis un clic utilisateur (sinon les navigateurs bloquent).
  const start = useCallback(async (): Promise<StartResult> => {
    setError(null);

    if (!browserSupportsSpeechRecognition) {
      const reason = "Reconnaissance vocale non supportée sur ce navigateur.";
      setError(reason);
      return { ok: false, reason };
    }

    // HTTPS requis (ou localhost)
    const isSecure = typeof window !== "undefined" &&
      (location.protocol === "https:" || location.hostname === "localhost");
    if (!isSecure) {
      const reason = "Le micro nécessite HTTPS (ou localhost).";
      setError(reason);
      return { ok: false, reason };
    }

    // 1) Permission micro (doit suivre un vrai clic)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      const reason = "Permission micro refusée/bloquée dans le navigateur.";
      setError(reason);
      return { ok: false, reason };
    }

    // 2) Instancie la SR native
    try {
      const rec = new SR();
      rec.lang = language;
      rec.continuous = true;
      rec.interimResults = false;

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e) => {
        const code = e?.error || String(e);
        setError(`SR error: ${code}`);
        // Chrome peut appeler onerror puis onend → on laisse l’arrêt tel quel
      };
      rec.onresult = (ev: SpeechRecognitionEvent) => {
        // 1) Ne lire que les nouveaux résultats finaux
        const { resultIndex, results } = ev;
        let addedText = "";
      
        for (let i = resultIndex; i < results.length; i++) {
          const res = results[i]; // SpeechRecognitionResult
          if (!res.isFinal) continue; // on ignore les intermédiaires
          addedText += (addedText ? " " : "") + res[0].transcript;
        }
      
        // Rien de nouveau ? on sort
        if (!addedText) return;
      
        // 2) (optionnel) afficher le transcript "humain"
        setTranscript(prev => (prev ? `${prev} ${addedText}` : addedText));
      
        // 3) Mettre à jour le buffer uniquement avec CE delta
        const delta = normalize(addedText);
        if (!delta) return;
      
        const next = normalize(`${bufferRef.current} ${delta}`).slice(-maxBufferChars);
        bufferRef.current = next;
      
        // 4) Tenter la consommation (1–2 fois suffisent en général)
        //    Si tu veux strictement 1 incrément par chunk, remplace le while par un if.
        let guard = 0;
        while (tryConsume() && guard < 2) guard++;
      };;

      recRef.current = rec;
      rec.start(); // onstart mettra listening=true
      return { ok: true };
    } catch (e) {
      const reason = `start() failed: ${e}`;
      setError(reason);
      setListening(false);
      return { ok: false, reason };
    }
  }, [SR, language, maxBufferChars, tryConsume, browserSupportsSpeechRecognition]);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {
      // ignore
    }
    setListening(false);
  }, []);

  // --- Entretien léger : clamp buffer + reset transcript si énorme (optionnel)
  useEffect(() => {
    const iv = setInterval(() => {
      bufferRef.current = bufferRef.current.slice(-maxBufferChars);
      // on peut aussi purger transcript si tu l'affiches :
      if (transcript.split(" ").length > 150) setTranscript((s) => s.split(" ").slice(-80).join(" "));
    }, 5000);
    return () => clearInterval(iv);
  }, [maxBufferChars, transcript]);

  // --- Cleanup on unmount
  useEffect(() => () => { try { recRef.current?.stop(); } catch {
    // ignore
  } }, []);

  return {
    count,
    listening,
    error, // utile pour afficher un message en UI
    transcript, // (facultatif) pour debug
    browserSupportsSpeechRecognition,
    start, // () => Promise<{ok:boolean, reason?:string}>
    stop,  // () => void
    debug: { buffer: bufferRef.current },
  };
}
