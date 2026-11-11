import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useId, useLayoutEffect, useState, type KeyboardEvent } from "react";

import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
import { cva } from "~/lib/cva";
import { disabledControlStyle } from "~/components/ui/form/styles/control-styles";
import { floatingListOptionStyle } from "~/components/ui/panel/styles/floating-list-styles";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  ariaLabel: string;
  disabled?: boolean;
  onValueChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  variant?: "default" | "grouped";
  value: T;
};

const selectTriggerStyle = cva(
  "border-border-base hover:border-border-strong bg-surface-base text-text-base col-start-1 row-start-1 flex h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 border text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "rounded-md px-3",
        grouped:
          "justify-center rounded-none border-0 bg-transparent px-2 text-base hover:border-0 hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const selectWidthProbeStyle = cva(
  "pointer-events-none invisible col-start-1 row-start-1 inline-flex h-9 items-center gap-1.5 text-sm font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "rounded-md border px-3",
        grouped: "px-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Select<T extends string>({
  ariaLabel,
  disabled = false,
  onValueChange,
  options,
  variant = "default",
  value,
}: SelectProps<T>) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOptionIndex = Math.max(selectedIndex, 0);
  const selectedOption = options[selectedIndex];

  const { context, floatingStyles, isPositioned, refs } = useFloating({
    middleware: [
      offset(4),
      flip({ fallbackAxisSideDirection: "end", padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements }) {
          elements.floating.style.setProperty(
            "--floating-panel-available-height",
            `${Math.min(360, Math.max(0, availableHeight))}px`
          );
          elements.floating.style.setProperty(
            "--floating-panel-available-width",
            `${Math.max(0, availableWidth)}px`
          );
        },
      }),
    ],
    onOpenChange: (open) => {
      setIsOpen(open);
      setActiveIndex(open ? selectedOptionIndex : -1);
    },
    open: isOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const { getFloatingProps, getReferenceProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  useLayoutEffect(() => {
    if (!isOpen || !isPositioned || activeIndex < 0) return;
    const panel = refs.floating.current;
    const viewport = panel?.querySelector<HTMLElement>(".scrollbar-none");
    const option =
      panel?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex];
    if (!viewport || !option) return;

    const viewportBounds = viewport.getBoundingClientRect();
    const optionBounds = option.getBoundingClientRect();
    // scrollIntoViewは外側の画面も動かすため、候補の領域だけを移動します。
    if (optionBounds.top < viewportBounds.top) {
      viewport.scrollTop += optionBounds.top - viewportBounds.top;
    } else if (optionBounds.bottom > viewportBounds.bottom) {
      viewport.scrollTop += optionBounds.bottom - viewportBounds.bottom;
    }
  }, [activeIndex, isOpen, isPositioned, refs.floating]);

  const selectOption = (option: SelectOption<T>) => {
    onValueChange(option.value);
    setIsOpen(false);
    setActiveIndex(-1);
    (refs.domReference.current as HTMLElement | null)?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => {
        if (current >= 0) {
          return event.key === "ArrowDown"
            ? Math.min(current + 1, options.length - 1)
            : Math.max(current - 1, 0);
        }

        return selectedOptionIndex;
      });
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(selectedOptionIndex);
        return;
      }

      const activeOption = options[activeIndex];
      if (activeOption) selectOption(activeOption);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <>
      <div className="inline-grid max-w-full">
        {options.map((option) => (
          <span
            key={option.value}
            aria-hidden="true"
            className={selectWidthProbeStyle({ variant })}
          >
            {option.label}
            <ChevronsUpDown className="size-4 shrink-0" />
          </span>
        ))}
        <button
          {...getReferenceProps({ onKeyDown: handleTriggerKeyDown })}
          ref={refs.setReference}
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className={`${selectTriggerStyle({ variant })} ${disabledControlStyle}`}
          disabled={disabled}
          type="button"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0" />
        </button>
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            // Floating UIが提供するfloating callback refをSelectのpositioning elementへ接続するため、この行のみrefs ruleを抑制する
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            id={listboxId}
            aria-label={ariaLabel}
            className="z-140 w-max max-w-(--floating-panel-available-width) [&_.scrollbar-none]:overscroll-y-contain"
          >
            <FloatingListSurface scrollable scrollTabIndex={-1}>
              {options.map((option, index) => {
                const selected = option.value === value;

                return (
                  <button
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    aria-selected={selected}
                    className={floatingListOptionStyle({ selected })}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    type="button"
                  >
                    <span className="truncate whitespace-nowrap">
                      {option.label}
                    </span>
                    <Check
                      aria-hidden="true"
                      className={`size-4 shrink-0 ${selected ? "" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
            </FloatingListSurface>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
