import StatCard from "../components/StatCard";
import CampaignCard from "../components/CampaignCard";
import { MOCK } from "../data";

export default function Dashboard() {
  // Données mockées pour l’UI (à remplacer par Supabase ensuite)
  const stats = [
    { label: "Total de confessions", value: 125 },
    { label: "Jours actifs", value: 30 },
    { label: "Meilleure série", value: "15 jours", highlight: true },
  ];

  const campaigns = MOCK.filter((c) => c.status === "Active");

  return (
    <div className="bg-[#f6f7f8] min-h-screen flex justify-center items-center py-4 max-sm:px-5">
      <div className="w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bienvenue, continuez votre cheminement spirituel.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </section>

        {/* Campagnes actives */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Campagnes actives</h2>

          <div className="space-y-4">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} to={`/session/${c.id}`} progress={c.completion} {...c} />
            ))}
          
            {/* Encadré “explorer” */}
            <div
              className="rounded-2xl border-2 border-dashed border-[#4A9EE6]/30 p-5 bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Explorer de nouvelles campagnes
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Découvrez d’autres thèmes pour approfondir votre foi.
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4A9EE6]/10 px-4 py-2
                                 text-[#2B67A2] ring-1 ring-[#4A9EE6]/30 hover:bg-[#4A9EE6]/15"
                >
                  Découvrir <span>＋</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
