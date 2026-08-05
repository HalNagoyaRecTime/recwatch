import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "~/lib/cn";

import type { DataTableSortDirection } from "~/components/ui/data-table/data-table-types";

type DataTableSortButtonProps = {
  children: ReactNode;
  direction?: DataTableSortDirection;
  onClick: () => void;
};

export function DataTableSortButton({
  children,
  direction,
  onClick,
}: DataTableSortButtonProps) {
  const Icon =
    direction === "asc"
      ? ArrowUp
      : direction === "desc"
        ? ArrowDown
        : ChevronsUpDown;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-sm transition-colors",
        direction ? "text-text-base" : "text-text-muted hover:text-text-base"
      )}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Icon
        aria-hidden="true"
        className={
          direction ? "size-3.5 shrink-0" : "text-text-subtle size-3.5 shrink-0"
        }
      />
    </button>
  );
}
