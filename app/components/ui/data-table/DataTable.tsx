import type { CSSProperties } from "react";

import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";
import { DataTableHeader } from "~/components/ui/data-table/DataTableHeader";
import { DataTableRow } from "~/components/ui/data-table/DataTableRow";
import { dataTableGridStyle } from "~/components/ui/data-table/styles/data-table-styles";
import type { DataTableProps } from "~/components/ui/data-table/data-table-types";
import { useResizableColumns } from "~/components/ui/data-table/useResizableColumns";

export type {
  DataTableColumn,
  DataTableColumnAlignment,
  DataTableColumnEdge,
  DataTableColumnPadding,
  DataTableColumnWidth,
} from "~/components/ui/data-table/data-table-types";

export function DataTable<T>({
  ariaLabel,
  columns,
  emptyMessage = "表示するデータがありません",
  footer,
  getRowKey,
  items,
  onSortChange,
  sort,
}: DataTableProps<T>) {
  const mainColumns = columns.filter((col) => col.edge === undefined);
  const rightColumns = columns.filter((col) => col.edge === "right");
  const endColumns = columns.filter((col) => col.edge === "end");

  const {
    gridTemplateColumns,
    minimumTableWidth,
    resetColumnWidth,
    resizingColumnId,
    setColumnWidth,
    startResize,
  } = useResizableColumns(mainColumns);

  const edgeMinimumWidth = [...rightColumns, ...endColumns].reduce(
    (total, column) =>
      total +
      (column.width.type === "fixed" ? column.width.value : column.width.min),
    0
  );

  const tableStyle = {
    "--data-table-columns": gridTemplateColumns,
    minWidth: `max(100%, ${minimumTableWidth + edgeMinimumWidth}px)`,
  } as CSSProperties;

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      <LayeredPanel
        role="table"
        aria-label={ariaLabel}
        className="text-left text-sm"
        header={
          <DataTableHeader
            mainColumns={mainColumns}
            rightColumns={rightColumns}
            endColumns={endColumns}
            onResetColumnWidth={resetColumnWidth}
            onResizeColumnWidth={setColumnWidth}
            onSortChange={onSortChange}
            onStartColumnResize={startResize}
            resizingColumnId={resizingColumnId}
            sort={sort}
          />
        }
        footer={footer}
        innerStyle={tableStyle}
        padding="none"
      >
        <div role="rowgroup">
          {items.length === 0 ? (
            <div className="grid" role="row" style={dataTableGridStyle}>
              <div
                className="text-text-muted col-span-full px-5 py-12 text-center"
                role="cell"
              >
                {emptyMessage}
              </div>
            </div>
          ) : (
            items.map((item) => (
              <DataTableRow
                key={getRowKey(item)}
                mainColumns={mainColumns}
                rightColumns={rightColumns}
                endColumns={endColumns}
                item={item}
              />
            ))
          )}
        </div>
      </LayeredPanel>
    </div>
  );
}
