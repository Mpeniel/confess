import { useRef, useState } from "react";

export default function TestSpeech() {
  const recRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSecure = typeof window !== "undefined" &&
    (location.protocol === "https:" || location.hostname === "localhost");

  async function handleStart() {
    setError(null);
    setTranscript("");

    // 1) checks rapides
    if (!isSecure) {
      setError("HTTPS requis (ou localhost).");
      return;
    }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) {
      setError("Web Speech API non supportée sur ce navigateur (essaie Chrome Desktop).");
      return;
    }

    // 2) permission micro (doit suivre un click utilisateur)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Permission micro refusée/bloquée (icône cadenas → autoriser).");
      return;
    }

    // 3) reco native
    try {
      const rec = new SR();
      rec.lang = "fr-FR";
      rec.continuous = true;
      rec.interimResults = false;

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e) => setError(`SR error: ${e?.error || String(e)}`);
      rec.onresult = (ev) => {
        const text = Array.from(ev.results).map((r) => r[0].transcript).join(" ");
        setTranscript(prev => (prev ? prev + " " : "") + text);
      };

      recRef.current = rec;
      rec.start(); // déclenche l’écoute
    } catch (e) {
      setError(`start() failed: ${e}`);
      setListening(false);
    }
  }

  function handleStop() {
    try { recRef.current?.stop(); } catch {
        // ignore
    }
    setListening(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Test reconnaissance vocale (natif)</h1>
        <p className="text-sm text-gray-600 mt-1">
          Cliquez “Start listening”, autorisez le micro, puis parlez.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleStart}
            disabled={listening}
            className="rounded-xl px-4 py-2 bg-[#4A9EE6] text-white font-semibold disabled:opacity-50"
          >
            ▶ Start listening
          </button>
          <button
            onClick={handleStop}
            disabled={!listening}
            className="rounded-xl px-4 py-2 ring-1 ring-gray-300 bg-white disabled:opacity-50"
          >
            ⏸ Stop
          </button>
          <span className={`text-sm ${listening ? "text-green-600" : "text-gray-500"}`}>
            {listening ? "Écoute en cours…" : "À l’arrêt"}
          </span>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5">
          <div className="text-xs text-gray-500 mb-1">Transcript :</div>
          <div className="min-h-24 whitespace-pre-wrap text-sm bg-gray-50 rounded-xl p-3 border border-gray-200">
            {transcript || "— Le texte reconnu s’affichera ici —"}
          </div>
        </div>

        {/* Diagnostique rapide */}
        <Diag />
      </div>
    </div>
  );
}

function Diag() {
  const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
  const httpsOk = location.protocol === "https:" || location.hostname === "localhost";
  return (
    <div className="mt-4 text-xs text-gray-500 space-y-1">
      <div>HTTPS: {httpsOk ? "yes" : "no"}</div>
      <div>SpeechRecognition object: {SR ? "present" : "missing"}</div>
      <div>
        Astuce : si vous voyez “present” mais aucun texte ne sort, vérifiez les
        autorisations micro via l’icône cadenas (ou essayez Chrome Desktop).
      </div>
    </div>
  );
}
