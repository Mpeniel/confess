interface StatCardProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}
export default function StatCard({ label, value, highlight = false }: StatCardProps) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className={`mt-2 text-2xl font-semibold ${highlight ? 'text-[#4A9EE6]' : ''}`}>
          {value}
        </div>
      </div>
    )
  }
  