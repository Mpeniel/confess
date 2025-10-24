import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FilterPill from "../components/FilterPill";
import StatusBadge from "../components/StatusBadge";
import ProgressMini from "../components/ProgressMini";
import NewCampaignForm, { type NewCampaignFormValues } from "../components/NewCampaignForm";
import { MOCK, type Campaign } from "../data";
type Tab = "All" | "Collective" | "Individual" | "Completed";

export default function CampaignsOverview() {
  const [tab, setTab] = useState<Tab>("All");
  const [rows, setRows] = useState<Campaign[]>(MOCK);
  const [showForm, setShowForm] = useState(false);

  const data = useMemo(() => {
    if (tab === "All") return rows;
    if (tab === "Completed")
      return rows.filter((c) => c.status === "Completed");
    return rows.filter((c) => c.type === tab);
  }, [tab, rows]);

  const handleCreate = (v: NewCampaignFormValues) => {
    // Pour le MVP on ajoute localement une ligne. (Plus tard: appel Supabase)
    const newItem: Campaign = {
      id: crypto.randomUUID(),
      title: v.title,
      type: v.type,
      participants: 0,
      completion: 0,
      status: "Active",
      goal: v.target,
    };
    setRows(prev => [newItem, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="safe-top bg-[#f6f7f8] h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Campaigns Overview
            </h1>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4A9EE6] text-white px-4 py-2
                     font-semibold shadow-sm hover:opacity-90"
          >
            {showForm ? "Fermer" : "New Campaign"}
          </button>
        </div>

        {/* ⬇️ Formulaire repliable au-dessus du tableau */}
        {showForm && (
          <div className="mt-6">
            <NewCampaignForm
              onCancel={() => setShowForm(false)}
              onCreate={handleCreate}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          {(["All", "Collective", "Individual", "Completed"] as Tab[]).map(
            (t) => (
              <FilterPill key={t} active={tab === t} onClick={() => setTab(t)}>
                {t}
              </FilterPill>
            )
          )}
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Campaign name</Th>
                <Th className="text-right">Participants</Th>
                <Th className="text-center">Completion rate</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <Td>
                    <Link
                      to={`/admin/campaigns/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-gray-500">{c.type}</div>
                  </Td>
                  <Td className="text-right">{c.participants}</Td>
                  <Td className="text-center">
                    <ProgressMini value={c.completion} />
                  </Td>
                  <Td className="text-right">
                    <StatusBadge status={c.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ——— Table helpers ——— */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-6 py-5 align-middle text-sm text-gray-800 ${className}`}>
      {children}
    </td>
  );
}
