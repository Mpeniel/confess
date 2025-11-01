import { useNavigate, useParams } from "react-router-dom";
import { useNavbarOffset } from "../hooks";
import mic from "../assets/icons/mic.svg";
import { MOCK } from "../data";
import { useSpeechCounter } from "../hooks/useSpeechCounter";

export default function Session() {
  const params = useParams();
  const phrase =  MOCK.find((c) => c.id === params.id)?.phrase;
  const navigate = useNavigate();

  const { count, listening, error, start, stop } = useSpeechCounter(phrase, { mode: "contains", minWordsRatio: 0.6, minWordsAbsolute: 5 });
  console.log(count);

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
      {/* <p>{transcript}</p> */}

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
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => stop()}
          disabled={!listening}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-700
                     border border-gray-200 px-4 py-2 font-medium shadow-sm
                     hover:bg-gray-50 disabled:opacity-50"
        >
          ⏸ Pause
        </button>

        <button
          type="button"
          onClick={() => start()}
          disabled={listening}
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
