import type { DataTableSort } from "~/components/ui/data-table/data-table-types";

type SortValue = number | string | null | undefined;

const collator = new Intl.Collator("ja", {
  numeric: true,
  sensitivity: "base",
});

export function getNextManagementTableSort(
  current: DataTableSort | undefined,
  columnId: string
): DataTableSort {
  return {
    columnId,
    direction:
      current?.columnId === columnId && current.direction === "asc"
        ? "desc"
        : "asc",
  };
}

export function sortManagementTableItems<T>(
  items: readonly T[],
  sort: DataTableSort | undefined,
  getValue: (item: T, columnId: string) => SortValue
): T[] {
  if (!sort) return [...items];

  return items
    .map((item, index) => ({ index, item }))
    .sort((left, right) => {
      const comparison = compareValues(
        getValue(left.item, sort.columnId),
        getValue(right.item, sort.columnId)
      );
      if (comparison === 0) return left.index - right.index;
      return sort.direction === "asc" ? comparison : -comparison;
    })
    .map(({ item }) => item);
}

function compareValues(left: SortValue, right: SortValue): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return collator.compare(String(left), String(right));
}
