import { SearchIcon } from "lucide-react";

import { useSearchBarActivation } from "~/features/frame/main-header/search/hooks/useSearchBarActivation";
import { useSearchShortcutWidths } from "~/features/frame/main-header/search/hooks/useSearchShortcutWidths";
import { cn } from "~/lib/cn";

type SearchBarContentProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  query: string;
  onChange: (value: string) => void;
  onOpen: () => void;
};

export function SearchBarContent({
  inputRef,
  isOpen,
  query,
  onChange,
  onOpen,
}: SearchBarContentProps) {
  const {
    ctrlShortcutRef,
    currentShortcutLabel,
    currentShortcutWidth,
    escShortcutRef,
  } = useSearchShortcutWidths({ isOpen });
  const { handleActivate } = useSearchBarActivation({ inputRef, onOpen });

  return (
    <button
      onClick={handleActivate}
      className={cn(
        "flex h-full max-h-12 w-full min-w-0 shrink-0",
        isOpen
          ? "bg-surface-base cursor-text duration-500"
          : "cursor-pointer bg-transparent duration-1200"
      )}
    >
      <div
        className={cn(
          "app-rounded flex h-full w-full items-center gap-2 border px-2.5 transition",
          "border-border-base",
          "transition-[border-color,background-color,color] ease-in-out",
          "hover:border-border-strong hover:bg-surface-hover hover:text-text-base"
        )}
      >
        <SearchIcon
          size={13}
          strokeWidth={1.8}
          className="text-text-muted shrink-0"
        />
        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onOpen}
            placeholder="画面を検索..."
            className={cn(
              "app-text-small text-text-subtle placeholder:text-text-subtle min-w-0 flex-1 bg-transparent outline-none",
              isOpen ? "cursor-text" : "cursor-pointer"
            )}
          />
          <span className="border-border-subtle text-text-subtle ml-auto inline-flex shrink-0 items-center rounded-md border px-1.5 py-px font-['DM_Mono'] text-[11px]">
            <span
              className="app-text-small relative inline-flex h-[1.2em] items-center justify-center overflow-hidden whitespace-nowrap transition-[width] duration-200 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ width: `${currentShortcutWidth}px` }}
            >
              <span className="absolute inset-0 inline-flex items-center justify-center whitespace-nowrap transition-opacity duration-150 ease-[cubic-bezier(.22,1,.36,1)]">
                {currentShortcutLabel}
              </span>
            </span>
          </span>
          <span
            className="pointer-events-none absolute -z-10 opacity-0"
            aria-hidden="true"
          >
            <span
              ref={ctrlShortcutRef}
              className="app-text-small whitespace-nowrap"
            >
              Ctrl + K
            </span>
            <span
              ref={escShortcutRef}
              className="app-text-small whitespace-nowrap"
            >
              ESC
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}
