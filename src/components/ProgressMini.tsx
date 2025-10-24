export default function ProgressMini({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, value));
    return (
      <div className="flex items-center gap-3">
        <div className="w-40 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-[#4A9EE6] transition-all"
            style={{ width: `${v}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">{v}%</span>
      </div>
    );
  }
  