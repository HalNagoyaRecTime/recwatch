import { cn } from "~/lib/cn";

import { DataTableColumnResizeHandle } from "~/components/ui/data-table/DataTableColumnResizeHandle";
import { DataTableSortButton } from "~/components/ui/data-table/DataTableSortButton";
import {
  dataTableColumnAlignmentClass,
  dataTableColumnPaddingClass,
  dataTableGridStyle,
} from "~/components/ui/data-table/styles/data-table-styles";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

type DataTableHeaderProps<T> = {
  endColumns: readonly DataTableColumn<T>[];
  mainColumns: readonly DataTableColumn<T>[];
  rightColumns: readonly DataTableColumn<T>[];
  onResetColumnWidth: (columnId: string) => void;
  onResizeColumnWidth: (columnId: string, width: number) => void;
  onSortChange?: (columnId: string) => void;
  onStartColumnResize: (
    columnId: string,
    currentWidth: number,
    pointerX: number
  ) => void;
  resizingColumnId?: string;
  sort?: { columnId: string; direction: "asc" | "desc" };
};

export function DataTableHeader<T>({
  endColumns,
  mainColumns,
  rightColumns,
  onResetColumnWidth,
  onResizeColumnWidth,
  onSortChange,
  onStartColumnResize,
  resizingColumnId,
  sort,
}: DataTableHeaderProps<T>) {
  const renderColumnHeader = (
    column: DataTableColumn<T>,
    resizable: boolean
  ) => {
    const width =
      resizable && column.width.type === "fluid" ? column.width : undefined;
    const align = column.align ?? "start";
    const padding = column.padding ?? "default";
    const sortDirection =
      sort?.columnId === column.id ? sort.direction : undefined;
    const isSortable = column.sortable === true && onSortChange !== undefined;

    return (
      <div
        key={column.id}
        className={cn(
          "relative flex min-w-0 items-center py-3 font-normal",
          dataTableColumnAlignmentClass[align],
          dataTableColumnPaddingClass[padding]
        )}
        aria-sort={
          isSortable
            ? sortDirection === "asc"
              ? "ascending"
              : sortDirection === "desc"
                ? "descending"
                : "none"
            : undefined
        }
        role="columnheader"
        style={
          resizable
            ? undefined
            : {
                width:
                  column.width.type === "fixed"
                    ? column.width.value
                    : column.width.min,
              }
        }
      >
        {isSortable ? (
          <DataTableSortButton
            direction={sortDirection}
            onClick={() => onSortChange(column.id)}
          >
            {column.header}
          </DataTableSortButton>
        ) : (
          <div className="min-w-0 truncate">{column.header}</div>
        )}
        {width && width.resizable !== false && (
          <DataTableColumnResizeHandle
            ariaLabel={`${typeof column.header === "string" ? column.header : column.id}列の幅を変更`}
            onPointerResizeStart={(currentWidth, pointerX) =>
              onStartColumnResize(column.id, currentWidth, pointerX)
            }
            onReset={() => onResetColumnWidth(column.id)}
            onResize={(nextWidth) => onResizeColumnWidth(column.id, nextWidth)}
            isResizing={resizingColumnId === column.id}
            width={width}
          />
        )}
      </div>
    );
  };

  const renderEdgeGroup = (columns: readonly DataTableColumn<T>[]) =>
    columns.length > 0 ? (
      <div className="text-text-muted flex shrink-0 items-center justify-end">
        {columns.map((column) => renderColumnHeader(column, false))}
      </div>
    ) : null;

  return (
    <div role="rowgroup" className="shrink-0">
      <div className="flex w-full flex-row items-stretch" role="row">
        <div
          className="text-text-muted grid min-w-0 flex-1 items-stretch"
          style={dataTableGridStyle}
        >
          {mainColumns.map((column) => renderColumnHeader(column, true))}
        </div>
        {renderEdgeGroup(rightColumns)}
        {renderEdgeGroup(endColumns)}
      </div>
    </div>
  );
}
