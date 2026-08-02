import {
  autoUpdate,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";

import { FloatingListSurface } from "~/components/ui/panel/FloatingListSurface";
import { cva } from "~/lib/cva";
import { floatingListOptionStyle } from "~/components/ui/panel/styles/floating-list-styles";

const floatingListOptionHeight = 36;
const floatingListSurfaceInset = 9;

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectProps<T extends string> = {
  ariaLabel: string;
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

  const { context, floatingStyles, refs } = useFloating({
    middleware: [
      offset(({ rects }) => ({
        mainAxis: -rects.reference.height - floatingListSurfaceInset,
      })),
      shift({ padding: 8 }),
    ],
    onOpenChange: (open) => {
      setIsOpen(open);
      setActiveIndex(open ? selectedOptionIndex : -1);
    },
    open: isOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const { getFloatingProps, getReferenceProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);
  const selectedOptionOffset = selectedOptionIndex * floatingListOptionHeight;
  const selectPanelStyle = {
    ...floatingStyles,
    transform: `${floatingStyles.transform ?? ""} translateY(-${selectedOptionOffset}px)`,
  };

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
          className={selectTriggerStyle({ variant })}
          type="button"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0" />
        </button>
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            style={selectPanelStyle}
            {...getFloatingProps()}
            className="z-140 w-max max-w-full"
          >
            <FloatingListSurface id={listboxId} aria-label={ariaLabel}>
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
