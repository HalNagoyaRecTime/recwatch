import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { useSearchResultScroll } from "~/features/frame/main-header/search/hooks/useSearchResultScroll";
import type { NavigationSearchResult } from "~/features/frame/main-header/search/model/navigation-search";
import { cn } from "~/lib/cn";

type SearchResultsPanelProps = {
  results: readonly NavigationSearchResult[];
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
    <div className="app-rounded border-border-base bg-surface-base flex min-h-0 flex-1 flex-col overflow-hidden border">
      <ScrollbarArea className="min-h-0 flex-1 overscroll-y-contain">
        <ul
          id="navigation-search-results"
          role="listbox"
          aria-label="画面検索の候補"
          className="space-y-1.5 p-2"
        >
          {results.length === 0 ? (
            <li className="app-text-small text-text-subtle px-3 py-8 text-center">
              該当する画面はありません
            </li>
          ) : null}
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`navigation-search-option-${result.id}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="option"
              aria-selected={selectedIndex === index}
              tabIndex={-1}
              onMouseEnter={() => onSelectIndex(index)}
              onClick={() => onConfirmIndex(index)}
              className={cn(
                "app-rounded flex min-h-10 cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors",
                selectedIndex === index
                  ? "bg-surface-hover"
                  : "hover:bg-surface-hover"
              )}
            >
              <span className="app-text-small text-text-base">
                {result.title}
              </span>
              <span className="bg-surface-muted text-text-muted app-rounded shrink-0 px-2 py-px text-[10px] uppercase">
                {result.category}
              </span>
            </li>
          ))}
        </ul>
      </ScrollbarArea>
    </div>
  );
}
