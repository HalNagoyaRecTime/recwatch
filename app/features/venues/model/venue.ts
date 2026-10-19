export type Venue = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const venueSortableColumnIds = [
  "id",
  "name",
  "created-at",
  "updated-at",
] as const;

export type VenueSortableColumnId = (typeof venueSortableColumnIds)[number];

export type VenueSort = {
  columnId: VenueSortableColumnId;
  direction: "asc" | "desc";
};

export function getNextVenueSort(
  current: VenueSort | undefined,
  columnId: VenueSortableColumnId
): VenueSort {
  if (current?.columnId === columnId && current.direction === "asc") {
    return { columnId, direction: "desc" };
  }

  return { columnId, direction: "asc" };
}

export function isVenueSortableColumnId(
  value: string
): value is VenueSortableColumnId {
  return venueSortableColumnIds.some((columnId) => columnId === value);
}
