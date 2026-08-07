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
    <section className="app-rounded border-border-subtle bg-surface-base flex min-h-0 flex-1 flex-col overflow-hidden border">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-4">
        <div className="text-text-subtle text-[11px] font-semibold tracking-[0.08em] uppercase">
          Search Area
        </div>
        <ul className="app-rounded border-border-subtle min-h-0 flex-1 space-y-2 overflow-y-auto border p-2">
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
                    ? "border-border-base bg-surface-hover"
                    : "hover:border-border-base hover:bg-surface-hover border-transparent"
                )}
              >
                <span className="app-text-small text-text-base">
                  {result.title}
                </span>
                <span className="border-border-subtle text-text-subtle rounded border px-2 py-px text-[10px] uppercase">
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
