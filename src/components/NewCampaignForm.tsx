import { useEffect, useRef, useState } from "react";

export type NewCampaignFormValues = {
  title: string;
  phrase: string;
  target: number;
  type: "Collective" | "Individual";
};

export default function NewCampaignForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (values: NewCampaignFormValues) => void;
}) {
  const [values, setValues] = useState<NewCampaignFormValues>({
    title: "",
    phrase: "",
    target: 1000,
    type: "Collective",
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus + scroll dans le viewport
    titleRef.current?.focus();
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handle = <K extends keyof NewCampaignFormValues>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues(v => ({ ...v, [k]: k === "target" ? Number(e.target.value) : (e.target.value) }));

  return (
    <div ref={cardRef}
         className="mb-8 rounded-3xl bg-white ring-1 ring-blue-200 shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Créer une campagne</h2>

      <form
        onSubmit={(e) => { e.preventDefault(); onCreate(values); }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Titre de la campagne</label>
          <input
            ref={titleRef}
            value={values.title}
            onChange={handle("title")}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3
                       focus:outline-none focus:ring-1 focus:ring-[#4A9EE6] placeholder:text-gray-400 placeholder:text-sm"
            placeholder="Ex : Déclarations de foi"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Phrase à confesser</label>
          <input
            value={values.phrase}
            onChange={handle("phrase")}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3
                       focus:outline-none focus:ring-1 focus:ring-[#4A9EE6] placeholder:text-gray-400 placeholder:text-sm"
            placeholder="Ex : Je suis mort et ressuscité avec Christ"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Objectif (nombre de confessions)
          </label>
          <input
            type="number"
            min={1}
            value={values.target}
            onChange={handle("target")}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3
                       focus:outline-none focus:ring-1 focus:ring-[#4A9EE6]"
            placeholder="Ex : 1000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type de campagne</label>
          <div className="flex items-center gap-6 px-2 py-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="type"
                checked={values.type === "Collective"}
                onChange={() => setValues(v => ({ ...v, type: "Collective" }))}
              />
              <span>Collectif</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="type"
                checked={values.type === "Individual"}
                onChange={() => setValues(v => ({ ...v, type: "Individual" }))}
              />
              <span>Individuel</span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 ring-1 ring-gray-300 bg-white hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-xl px-5 py-2 bg-[#4A9EE6] text-white font-semibold hover:opacity-90 shadow-sm"
          >
            Lancer la campagne
          </button>
        </div>
      </form>
    </div>
  );
}
