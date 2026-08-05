import { cn } from "~/lib/cn";

import {
  dataTableColumnAlignmentClass,
  dataTableColumnPaddingClass,
  dataTableGridStyle,
} from "~/components/ui/data-table/styles/data-table-styles";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

type DataTableRowProps<T> = {
  endColumns: readonly DataTableColumn<T>[];
  mainColumns: readonly DataTableColumn<T>[];
  rightColumns: readonly DataTableColumn<T>[];
  item: T;
};

export function DataTableRow<T>({
  endColumns,
  mainColumns,
  rightColumns,
  item,
}: DataTableRowProps<T>) {
  return (
    <div
      className="border-border-subtle flex h-16 w-full flex-row items-stretch border-b transition-colors last:border-b-0"
      role="row"
    >
      <div
        className="grid min-w-0 flex-1 items-center"
        style={dataTableGridStyle}
      >
        {mainColumns.map((column) => {
          const align = column.align ?? "start";
          const padding = column.padding ?? "default";

          return (
            <div
              key={column.id}
              className={cn(
                "min-w-0 truncate",
                dataTableColumnAlignmentClass[align],
                dataTableColumnPaddingClass[padding]
              )}
              role="cell"
            >
              {column.renderCell(item)}
            </div>
          );
        })}
      </div>
      {[rightColumns, endColumns].map((columns, groupIndex) =>
        columns.length > 0 ? (
          <div
            className="flex shrink-0 items-center justify-end"
            key={groupIndex}
          >
            {columns.map((column) => {
              const align = column.align ?? "start";
              const padding = column.padding ?? "default";

              return (
                <div
                  key={column.id}
                  className={cn(
                    "min-w-0 truncate",
                    dataTableColumnAlignmentClass[align],
                    dataTableColumnPaddingClass[padding]
                  )}
                  style={{
                    width:
                      column.width.type === "fixed"
                        ? column.width.value
                        : column.width.min,
                  }}
                  role="cell"
                >
                  {column.renderCell(item)}
                </div>
              );
            })}
          </div>
        ) : null
      )}
    </div>
  );
}
