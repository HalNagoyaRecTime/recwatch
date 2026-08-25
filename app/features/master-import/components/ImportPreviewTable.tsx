import { Button } from "~/components/ui/button/Button";
import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

import { MASTER_IMPORT_COLUMN_LABEL } from "../constants";

type ImportPreviewTableProps = {
  columns: readonly string[];
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
  rangeEnd: number;
  rangeStart: number;
  rows: readonly Record<string, unknown>[];
  rowsOffset: number;
  rowsTotal: number;
};

type IndexedRow = {
  index: number;
  values: Record<string, unknown>;
};

export function ImportPreviewTable({
  columns,
  isLoading,
  onNext,
  onPrevious,
  rangeEnd,
  rangeStart,
  rows,
  rowsOffset,
  rowsTotal,
}: ImportPreviewTableProps) {
  const tableColumns: readonly DataTableColumn<IndexedRow>[] = columns.map(
    (key) => ({
      header: MASTER_IMPORT_COLUMN_LABEL[key] ?? key,
      id: key,
      width: { type: "fluid", min: 140, grow: 1 },
      renderCell: (row) => formatValue(row.values[key]),
    })
  );
  const indexedRows = rows.map((values, index) => ({
    index: rowsOffset + index,
    values,
  }));

  return (
    <DataTable
      ariaLabel="取り込み内容"
      columns={tableColumns}
      emptyMessage="取り込み対象のデータはありません"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-text-muted text-xs">
            {rowsTotal.toLocaleString()}件中 {rangeStart}〜{rangeEnd}件を表示
          </span>
          <div className="flex gap-2">
            <Button
              disabled={rowsOffset === 0 || isLoading}
              onClick={onPrevious}
              size="sm"
              variant="secondary"
            >
              前へ
            </Button>
            <Button
              disabled={rangeEnd >= rowsTotal || isLoading}
              onClick={onNext}
              size="sm"
              variant="secondary"
            >
              次へ
            </Button>
          </div>
        </div>
      }
      getRowKey={(row) => row.index}
      items={indexedRows}
    />
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
