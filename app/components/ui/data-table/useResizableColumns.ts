import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DataTableColumnWidth } from "~/components/ui/data-table/data-table-types";

type ResizableColumnDefinition = {
  id: string;
  width: DataTableColumnWidth;
};

type ColumnWidths = Record<string, number>;

function clampColumnWidth(
  width: number,
  columnWidth: Extract<DataTableColumnWidth, { type: "fluid" }>
) {
  return Math.min(
    Math.max(width, columnWidth.min),
    columnWidth.max ?? Number.POSITIVE_INFINITY
  );
}

export function useResizableColumns(
  columns: readonly ResizableColumnDefinition[]
) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [resizingColumnId, setResizingColumnId] = useState<string>();
  const stopActiveResizeRef = useRef<() => void>(() => undefined);

  useEffect(() => () => stopActiveResizeRef.current(), []);

  const getFluidWidth = useCallback(
    (columnId: string) => {
      const width = columns.find((column) => column.id === columnId)?.width;
      return width?.type === "fluid" ? width : undefined;
    },
    [columns]
  );

  const setColumnWidth = useCallback(
    (columnId: string, width: number) => {
      const columnWidth = getFluidWidth(columnId);
      if (!columnWidth || columnWidth.resizable === false) return;

      setColumnWidths((current) => ({
        ...current,
        [columnId]: clampColumnWidth(width, columnWidth),
      }));
    },
    [getFluidWidth]
  );

  const resetColumnWidth = useCallback((columnId: string) => {
    setColumnWidths((current) => {
      if (current[columnId] === undefined) return current;

      const next = { ...current };
      delete next[columnId];
      return next;
    });
  }, []);

  const startResize = useCallback(
    (columnId: string, currentWidth: number, pointerX: number) => {
      const columnWidth = getFluidWidth(columnId);
      if (!columnWidth || columnWidth.resizable === false) return;

      stopActiveResizeRef.current();
      setResizingColumnId(columnId);

      let animationFrame: number | undefined;
      let nextWidth = currentWidth;

      const commitWidth = () => {
        animationFrame = undefined;
        setColumnWidth(columnId, nextWidth);
      };

      const handlePointerMove = (event: PointerEvent) => {
        nextWidth = currentWidth + event.clientX - pointerX;
        if (animationFrame === undefined) {
          animationFrame = window.requestAnimationFrame(commitWidth);
        }
      };

      const stopResize = () => {
        if (animationFrame !== undefined) {
          window.cancelAnimationFrame(animationFrame);
          commitWidth();
        }
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
        stopActiveResizeRef.current = () => undefined;
        setResizingColumnId((current) =>
          current === columnId ? undefined : current
        );
      };

      stopActiveResizeRef.current = stopResize;
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopResize);
      window.addEventListener("pointercancel", stopResize);
    },
    [getFluidWidth, setColumnWidth]
  );

  const gridTemplateColumns = useMemo(
    () =>
      columns
        .map((column) => {
          if (column.width.type === "fixed") {
            return `${column.width.value}px`;
          }

          const resizedWidth = columnWidths[column.id];
          if (resizedWidth !== undefined) return `${resizedWidth}px`;

          return `minmax(${column.width.min}px, ${column.width.grow ?? 1}fr)`;
        })
        .join(" "),
    [columnWidths, columns]
  );

  const minimumTableWidth = useMemo(
    () =>
      columns.reduce((total, column) => {
        if (column.width.type === "fixed") {
          return total + column.width.value;
        }

        return total + (columnWidths[column.id] ?? column.width.min);
      }, 0),
    [columnWidths, columns]
  );

  return {
    gridTemplateColumns,
    minimumTableWidth,
    resetColumnWidth,
    resizingColumnId,
    setColumnWidth,
    startResize,
  };
}
