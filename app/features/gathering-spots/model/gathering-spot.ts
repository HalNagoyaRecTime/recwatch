export type GatheringSpot = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const gatheringSpotSortableColumnIds = [
  "id",
  "name",
  "created-at",
  "updated-at",
] as const;

export type GatheringSpotSortableColumnId =
  (typeof gatheringSpotSortableColumnIds)[number];

export type GatheringSpotSort = {
  columnId: GatheringSpotSortableColumnId;
  direction: "asc" | "desc";
};

export function getNextGatheringSpotSort(
  current: GatheringSpotSort | undefined,
  columnId: GatheringSpotSortableColumnId
): GatheringSpotSort {
  if (current?.columnId === columnId && current.direction === "asc") {
    return { columnId, direction: "desc" };
  }

  return { columnId, direction: "asc" };
}

export function isGatheringSpotSortableColumnId(
  value: string
): value is GatheringSpotSortableColumnId {
  return gatheringSpotSortableColumnIds.some((columnId) => columnId === value);
}
