import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { SearchField } from "~/components/ui/form/SearchField";
import { controlSurfaceStyle } from "~/components/ui/form/styles/control-styles";

export type SearchOption = {
  badge?: string;
  description?: string;
  icon?: LucideIcon;
  id: string;
  label: string;
};

type SearchComboboxProps = {
  ariaLabel: string;
  emptyMessage?: string;
  onOptionSelect: (option: SearchOption) => void;
  onQueryChange: (value: string) => void;
  options: readonly SearchOption[];
  placeholder?: string;
  query: string;
};

/**
 * 使用例:
 * <SearchCombobox ariaLabel="通知を検索" onOptionSelect={handleSelect} onQueryChange={setQuery} options={options} query={query} />
 */
export function SearchCombobox({
  ariaLabel,
  emptyMessage = "候補がありません",
  onOptionSelect,
  onQueryChange,
  options,
  placeholder,
  query,
}: SearchComboboxProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const resolvedActiveIndex =
    isOpen && options.length > 0
      ? Math.min(Math.max(activeIndex, 0), options.length - 1)
      : -1;

  const openSuggestions = () => {
    setIsOpen(true);
    setActiveIndex((current) =>
      options.length === 0 ? -1 : Math.max(current, 0)
    );
  };

  const closeSuggestions = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const selectOption = (option: SearchOption) => {
    onOptionSelect(option);
    closeSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        options.length === 0 ? -1 : Math.max(current - 1, 0)
      );
    }

    if (event.key === "Enter" && resolvedActiveIndex >= 0) {
      event.preventDefault();
      selectOption(options[resolvedActiveIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSuggestions();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <SearchField
        aria-activedescendant={
          resolvedActiveIndex >= 0
            ? `${listboxId}-option-${resolvedActiveIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        ariaLabel={ariaLabel}
        inputRef={inputRef}
        onClick={openSuggestions}
        onFocus={openSuggestions}
        onKeyDown={handleKeyDown}
        onValueChange={(value) => {
          onQueryChange(value);
          openSuggestions();
        }}
        placeholder={placeholder}
        role="combobox"
        value={query}
      />

      {isOpen && (
        <div
          className={`${controlSurfaceStyle()} shadow-soft absolute top-[calc(100%+4px)] left-0 z-50 flex max-h-90 w-full flex-col overflow-hidden`}
        >
          <div
            id={listboxId}
            aria-label={`${ariaLabel}の候補`}
            className="min-h-0 overflow-y-auto py-1"
            role="listbox"
          >
            {options.length === 0 && (
              <p className="text-text-muted px-4 py-5 text-center text-sm">
                {emptyMessage}
              </p>
            )}

            {options.map((option, index) => {
              const Icon = option.icon;
              const active = resolvedActiveIndex === index;

              return (
                <button
                  key={option.id}
                  id={`${listboxId}-option-${index}`}
                  aria-selected={active}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    active ? "bg-surface-hover" : "hover:bg-surface-hover"
                  }`}
                  onClick={() => selectOption(option)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  type="button"
                >
                  {Icon && (
                    <Icon
                      aria-hidden="true"
                      className="text-text-subtle mt-0.5 size-4.5 shrink-0"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-text-base truncate text-sm font-medium">
                        {option.label}
                      </span>
                      {option.badge && (
                        <span className="bg-surface-muted text-text-muted app-rounded shrink-0 px-2 py-0.5 text-xs">
                          {option.badge}
                        </span>
                      )}
                    </span>
                    {option.description && (
                      <span className="text-text-muted mt-0.5 block truncate text-xs">
                        {option.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <footer className="border-border-base text-text-muted flex items-center justify-between border-t px-3 py-2 text-xs">
            <span>{options.length}件の候補</span>
            <span className="flex items-center gap-2">
              <kbd className="border-border-base bg-surface-muted app-rounded border px-1.5 py-0.5">
                Enter
              </kbd>
              決定
              <kbd className="border-border-base bg-surface-muted app-rounded border px-1.5 py-0.5">
                Esc
              </kbd>
              閉じる
            </span>
          </footer>
        </div>
      )}
    </div>
  );
}
