import type { CSSProperties } from "react";

import type {
  DataTableColumnAlignment,
  DataTableColumnPadding,
} from "~/components/ui/data-table/data-table-types";

export const dataTableGridStyle = {
  gridTemplateColumns: "var(--data-table-columns)",
} as CSSProperties;

export const dataTableColumnAlignmentClass: Record<
  DataTableColumnAlignment,
  string
> = {
  center: "justify-center text-center",
  end: "justify-end text-right",
  start: "justify-start text-left",
};

export const dataTableColumnPaddingClass: Record<
  DataTableColumnPadding,
  string
> = {
  default: "px-4",
  wide: "px-5",
};
