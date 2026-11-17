import { SearchIcon } from "lucide-react";
import type { RefObject } from "react";

import { useSearchBarActivation } from "~/features/frame/main-header/search/hooks/useSearchBarActivation";
import { useSearchShortcutWidths } from "~/features/frame/main-header/search/hooks/useSearchShortcutWidths";
import { cn } from "~/lib/cn";

type SearchBarContentProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  mobileTriggerRef: RefObject<HTMLButtonElement | null>;
  activeResultId?: string;
  isOpen: boolean;
  query: string;
  onChange: (value: string) => void;
  onOpen: () => void;
};

export function SearchBarContent({
  inputRef,
  mobileTriggerRef,
  activeResultId,
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
    <div
      className={cn(
        "relative w-full shrink-0",
        isOpen ? "h-10 md:h-11" : "h-full"
      )}
    >
      <button
        ref={mobileTriggerRef}
        type="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label="画面検索"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleActivate}
        className={cn(
          "app-rounded border-border-base text-text-muted hover:border-border-strong hover:bg-surface-hover hover:text-text-base h-full w-full cursor-pointer items-center justify-center border bg-transparent transition-colors md:hidden",
          isOpen ? "hidden" : "flex"
        )}
      >
        <SearchIcon aria-hidden="true" size={15} strokeWidth={1.8} />
      </button>

      <label
        className={cn(
          "app-rounded flex h-full w-full min-w-0 items-center gap-2 border px-2.5 transition-[border-color,background-color,color] ease-in-out",
          "border-border-base",
          isOpen
            ? "bg-surface-base"
            : "hover:border-border-strong hover:bg-surface-hover hover:text-text-base",
          isOpen ? "flex" : "hidden md:flex"
        )}
      >
        <SearchIcon
          aria-hidden="true"
          size={13}
          strokeWidth={1.8}
          className="text-text-muted shrink-0"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onOpen}
          placeholder="画面を検索..."
          aria-label="画面検索"
          aria-expanded={isOpen}
          aria-controls="navigation-search-results"
          aria-activedescendant={activeResultId}
          autoComplete="off"
          className="app-text-small text-text-subtle placeholder:text-text-subtle min-w-0 flex-1 bg-transparent outline-none"
        />
        <span className="border-border-subtle text-text-subtle ml-auto hidden shrink-0 items-center rounded-md border px-1.5 py-px font-['DM_Mono'] text-[11px] md:inline-flex">
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
      </label>
    </div>
  );
}
