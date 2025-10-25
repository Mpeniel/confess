import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavbarOffset } from "../hooks";
import mic from "../assets/icons/mic.svg";
import { useBufferedConfession } from "../hooks/useBufferedConfession";
import { MOCK } from "../data";

export default function Session() {
  const params = useParams();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState(false); 
  const phrase =  MOCK.find((c) => c.id === params.id)?.phrase;
  const navigate = useNavigate();

  const { count, listening, browserSupportsSpeechRecognition ,start, stop } = useBufferedConfession(phrase || "", {
    language: "fr-FR",
    anchors: ["je", "suis", "mort", "ressuscit", "christ"], // clé: "ressuscit" (stem)
    slackWords: 2,           // fenêtre +/- 2 mots
    maxFuzzyRatio: 0.22,     // ≈ 22% d’erreurs caractère
  });

  async function askMicPermission(): Promise<boolean> {
    try {
      // Déclenche la vraie permission (doit être appelée depuis un clic)
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      console.error(e);
      setError("Permission micro refusée. Autorise le micro dans les réglages du navigateur.");
      return false;
    }
  }

  async function handleStart() {
    setError(null);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || browserSupportsSpeechRecognition === false) {
      setError("Reconnaissance vocale non supportée par ce navigateur. Essaie Chrome Desktop.");
      console.error(error);
      return;
    }

    // Demande explicite de permission au clic (obligatoire en prod)
    if (!asked) {
      const ok = await askMicPermission();
      setAsked(true);
      if (!ok) return;
    }

    // Lancer l’écoute
    start();
    setRunning(true);
  }

  function handleStop() {
    stop();
    setRunning(false);
  }

  useNavbarOffset();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6
                    bg-linear-to-br from-[#F8FBFF] via-[#F5FAFF] to-[#EAF4FF]"
    >
      {/* Phrase */}
      <h1
        className="max-w-3xl text-center text-2xl md:text-4xl font-medium
                     text-gray-800 leading-snug mb-10"
      >
        “{phrase}”
      </h1>
      {/* <p>{debug.transcript}</p> */}

      {/* Halo ovale + cercle compteur (tout en flex, aucune position absolue) */}
      <div className="w-full max-w-4xl">
        <div className="py-5 w-full rounded-full bg-white border border-[#77B3DE]/20 shadow-lg
                     flex items-center justify-center ring-0 shadow-[#77B3DE]/30"
        >
          <div className="w-44 h-44 md:w-48 md:h-48 rounded-full bg-white
                       border-8 border-[#77B3DE]/30 shadow-md
                       flex flex-col items-center justify-center text-[#4A9EE6]"
          >
            <span className="text-5xl md:text-6xl font-extrabold">{count}</span>
            <img
              src={mic}
              alt="Microphone"
              className={`h-8 w-8 transition-opacity ${listening ? "opacity-100" : "opacity-40"}`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleStop()}
          disabled={!running}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700
                     border border-gray-200 px-4 py-2 font-medium shadow-sm
                     hover:bg-gray-50 disabled:opacity-50"
        >
          ⏸ Pause
        </button>

        <button
          type="button"
          onClick={() => handleStart()}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700
                     border border-gray-200 px-4 py-2 font-medium shadow-sm
                     hover:bg-gray-50 disabled:opacity-50"
        >
          ▶ Start
        </button>

        <button
          type="button"
          // onClick={() => {setCount((c) => c + 1)}}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700
                     border border-gray-200 px-4 py-2 font-medium shadow-sm
                     hover:bg-gray-50"
        >
          ＋1 Manual
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4A9EE6] text-white
                     px-5 py-2 font-semibold shadow-sm hover:opacity-90"
        >
          ✓ Finish
        </button>
      </div>
    </div>
  );
}
