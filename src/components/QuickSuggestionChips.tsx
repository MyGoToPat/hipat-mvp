import clsx from "clsx";

type Reply = { label: string; onClick: () => void };
type Props = { replies: Reply[]; hide?: boolean };

export default function QuickSuggestionChips({ replies, hide }: Props) {
  if (hide) return null;
  return (
    <div className="flex gap-3 mt-12 mb-16 flex-wrap justify-center transition-opacity duration-300 sm:flex-col md:flex-row sm:gap-y-3">
      {replies.map(r => (
        <button
          key={r.label}
          onClick={r.onClick}
          className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200
              bg-[--hipat-white] text-[--hipat-blue] border border-[--hipat-blue]
              hover:bg-[--hipat-purple] hover:text-[--hipat-white] hover:border-[--hipat-purple]
              shadow-[0_0_20px_rgba(26,124,247,0.2)] hover:shadow-[0_0_30px_rgba(180,92,255,0.3)]"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}