import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { anchorOrderMatch, fuzzyWindowMatch, normalize } from "../utils/text";

type Options = {
  language?: string;          // par défaut "fr-FR"
  maxBufferChars?: number;    // limite du buffer
  slackWords?: number;        // +/- autour de la fenêtre cible
  maxFuzzyRatio?: number;     // seuil Levenshtein relatif (0.0..1.0)
  anchors?: string[];         // stems obligatoires en ordre
};

export function useBufferedConfession(
  targetPhrase: string,
  opts: Options = {}
) {
  const {
    language = "fr-FR",
    maxBufferChars = 800,
    slackWords = 2,
    maxFuzzyRatio = 0.22,
    anchors = ["je", "suis", "mort", "ressuscit", "christ"], // stems utiles
  } = opts;

  const { transcript, listening, browserSupportsSpeechRecognition,resetTranscript } = useSpeechRecognition();

  const [count, setCount] = useState(0);
  const bufferRef = useRef<string>("");           // buffer normalisé concaténé
  const prevTranscriptRef = useRef<string>("");   // pour calculer le delta
  const normTarget = normalize(targetPhrase);

  const start = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language,
      interimResults: false,
    });
  };
  const stop = () => SpeechRecognition.stopListening();

  // Tente d’identifier un match et de "consommer" jusqu’à la fin du match
  const tryConsume = () => {
    const buf = bufferRef.current;

    // 1) essai ancres (rapide et robuste aux grosses déformations)
    const a = anchorOrderMatch(buf, anchors);
    if (a?.ok) {
      bufferRef.current = normalize(buf).slice(a.consumeChars).trimStart();
      setCount((c) => c + 1);
      return true;
    }

    // 2) essai fuzzy sur fenêtre glissante (précision fine)
    const f = fuzzyWindowMatch(buf, normTarget, slackWords, maxFuzzyRatio);
    if (f?.ok) {
      bufferRef.current = normalize(buf).slice(f.consumeChars).trimStart();
      setCount((c) => c + 1);
      return true;
    }

    return false;
  };

  // Réception des nouveaux morceaux du transcript
  useEffect(() => {
    const prev = prevTranscriptRef.current;
    const curr = transcript;

    // si la lib reset le transcript
    if (curr.length < prev.length) {
      prevTranscriptRef.current = curr;
      bufferRef.current = normalize(bufferRef.current + " " + curr).slice(-maxBufferChars);
      while (tryConsume()) { /* empty */ }
      return;
    }

    const delta = curr.slice(prev.length);
    prevTranscriptRef.current = curr;

    const next = normalize(bufferRef.current + " " + delta).slice(-maxBufferChars);
    bufferRef.current = next;

    // consomme tant qu’on trouve des matches dans le buffer
    let guarded = 0;
    while (tryConsume()) {
      guarded++;
      if (guarded > 5) break; // garde-fou
    }
  }, [transcript, normTarget, slackWords, maxFuzzyRatio, anchors, maxBufferChars]);

  // Entretien : purge transcript et clamp buffer
  useEffect(() => {
    const iv = setInterval(() => {
      if (transcript.split(" ").length > 120) resetTranscript();
      bufferRef.current = bufferRef.current.slice(-maxBufferChars);
    }, 5000);
    return () => clearInterval(iv);
  }, [transcript, maxBufferChars, resetTranscript]);

  return {
    count,
    listening,
    browserSupportsSpeechRecognition,
    start,
    stop,
    resetTranscript,
    debug: { buffer: bufferRef.current, transcript },
  };
}
