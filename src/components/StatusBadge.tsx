type Status = "Active" | "Inactive" | "Completed";
export default function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
    Completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}
