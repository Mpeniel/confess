type Props = {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  };
  export default function FilterPill({ active, children, onClick }: Props) {
    return (
      <button
        onClick={onClick}
        className={[
          "px-4 py-2 rounded-full text-sm font-medium transition",
          active
            ? "bg-[#E8F2FD] text-[#2B67A2] ring-1 ring-[#4A9EE6]/30"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        ].join(" ")}
      >
        {children}
      </button>
    );
  }
  