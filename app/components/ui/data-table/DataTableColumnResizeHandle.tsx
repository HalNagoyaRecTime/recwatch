import type { KeyboardEvent, PointerEvent } from "react";

import type { DataTableColumnWidth } from "~/components/ui/data-table/data-table-types";
import { cn } from "~/lib/cn";

type DataTableColumnResizeHandleProps = {
  ariaLabel: string;
  isResizing: boolean;
  onPointerResizeStart: (currentWidth: number, pointerX: number) => void;
  onReset: () => void;
  onResize: (width: number) => void;
  width: Extract<DataTableColumnWidth, { type: "fluid" }>;
};

export function DataTableColumnResizeHandle({
  ariaLabel,
  isResizing,
  onPointerResizeStart,
  onReset,
  onResize,
  width,
}: DataTableColumnResizeHandleProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const currentWidth =
      event.currentTarget.parentElement?.getBoundingClientRect().width ??
      width.min;
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    onResize(currentWidth + direction * (event.shiftKey ? 24 : 8));
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const currentWidth =
      event.currentTarget.parentElement?.getBoundingClientRect().width ??
      width.min;
    onPointerResizeStart(currentWidth, event.clientX);
  };

  return (
    <button
      aria-label={ariaLabel}
      className="group absolute top-0 right-0 z-10 h-full w-2 translate-x-1/2 cursor-col-resize touch-none"
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      title="ドラッグで列幅を変更、ダブルクリックでリセット"
      type="button"
    >
      <span
        className={cn(
          "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[background-color,height,width]",
          isResizing
            ? "bg-surface-hover h-7 w-2"
            : "group-hover:bg-surface-hover group-focus-visible:bg-surface-hover h-6 w-2 bg-transparent"
        )}
      >
        <span
          className={cn(
            "rounded-full transition-[background-color,height,width]",
            isResizing
              ? "bg-border-strong h-5 w-0.5"
              : "bg-border-subtle group-hover:bg-border-strong group-focus-visible:bg-border-strong h-4 w-px group-hover:h-5 group-hover:w-0.5 group-focus-visible:h-5 group-focus-visible:w-0.5"
          )}
        />
      </span>
    </button>
  );
}
