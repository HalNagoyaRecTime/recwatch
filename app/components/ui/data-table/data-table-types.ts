import type { Key, ReactNode } from "react";

export type DataTableColumnAlignment = "center" | "end" | "start";
export type DataTableColumnPadding = "default" | "wide";
export type DataTableSortDirection = "asc" | "desc";
/**
 * 列を配置する側。指定なしは左側の可変領域、right は右側の補助領域、
 * end は最右端の操作領域として扱います。
 */
export type DataTableColumnEdge = "end" | "right";

export type DataTableSort = {
  columnId: string;
  direction: DataTableSortDirection;
};

export type DataTableColumnWidth =
  | {
      type: "fixed";
      value: number;
    }
  | {
      grow?: number;
      max?: number;
      min: number;
      resizable?: boolean;
      type: "fluid";
    };

export type DataTableColumn<T> = {
  align?: DataTableColumnAlignment;
  /** 配置先。未指定は左、right は右側、end は最右端。 */
  edge?: DataTableColumnEdge;
  header: ReactNode;
  id: string;
  padding?: DataTableColumnPadding;
  renderCell: (item: T) => ReactNode;
  sortable?: boolean;
  width: DataTableColumnWidth;
};

export type DataTableProps<T> = {
  ariaLabel: string;
  columns: readonly DataTableColumn<T>[];
  emptyMessage?: ReactNode;
  footer?: ReactNode;
  getRowKey: (item: T) => Key;
  items: readonly T[];
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};
