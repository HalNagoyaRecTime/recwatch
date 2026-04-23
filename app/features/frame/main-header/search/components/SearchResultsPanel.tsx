import type { SearchResultItem } from "~/features/frame/main-header/search/constants/mockSearchResults";
import { useSearchResultScroll } from "~/features/frame/main-header/search/hooks/useSearchResultScroll";
import { cn } from "~/lib/cn";

type SearchResultsPanelProps = {
  results: SearchResultItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onConfirmIndex: (index: number) => void;
};

export function SearchResultsPanel({
  results,
  selectedIndex,
  onSelectIndex,
  onConfirmIndex,
}: SearchResultsPanelProps) {
  const { itemRefs } = useSearchResultScroll({ selectedIndex });

  return (
    <section className="app-rounded flex min-h-0 flex-1 flex-col overflow-hidden border border-(--border-1) bg-(--surface-1)">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-4">
        <div className="text-[11px] font-semibold tracking-[0.08em] text-(--text-3) uppercase">
          Search Area
        </div>
        <ul className="app-rounded min-h-0 flex-1 space-y-2 overflow-y-auto border border-(--border-1) p-2">
          {results.map((result, index) => (
            <li key={result.id}>
              <button
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                onMouseEnter={() => onSelectIndex(index)}
                onClick={() => onConfirmIndex(index)}
                className={cn(
                  "app-rounded flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition-colors",
                  selectedIndex === index
                    ? "border-(--border-2) bg-(--surface-2)"
                    : "border-transparent hover:border-(--border-2) hover:bg-(--surface-2)"
                )}
              >
                <span className="app-text-small text-(--text-1)">
                  {result.title}
                </span>
                <span className="rounded border border-(--border-1) px-2 py-px text-[10px] text-(--text-3) uppercase">
                  {result.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
