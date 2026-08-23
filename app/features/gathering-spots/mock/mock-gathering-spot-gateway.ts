import type {
  GatheringSpotGateway,
  GatheringSpotListOptions,
} from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

export function createMockGatheringSpotGateway(
  initialSpots: GatheringSpot[] = []
): GatheringSpotGateway {
  let spots = [...initialSpots];
  let nextId = spots.reduce((maxId, spot) => Math.max(maxId, spot.id), 0) + 1;

  return {
    async list(options?: GatheringSpotListOptions) {
      const query = options?.name?.trim().toLowerCase();
      const filtered = query
        ? spots.filter((spot) => spot.name.toLowerCase().includes(query))
        : spots;
      const sorted = options?.sort
        ? [...filtered].sort((left, right) => {
            const { columnId, direction } = options.sort!;
            const collator = new Intl.Collator("ja", {
              numeric: true,
              sensitivity: "base",
            });
            const result =
              columnId === "id"
                ? left.id - right.id
                : columnId === "name"
                  ? collator.compare(left.name, right.name)
                  : columnId === "created-at"
                    ? collator.compare(left.createdAt, right.createdAt)
                    : collator.compare(left.updatedAt, right.updatedAt);
            return direction === "asc" ? result : -result;
          })
        : filtered;
      const limit = options?.limit ?? filtered.length;
      const offset = options?.offset ?? 0;
      return {
        items: sorted.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      };
    },

    async getById(id) {
      const spot = spots.find((current) => current.id === id);
      if (!spot) throw new Error("集合場所が見つかりません。");
      return spot;
    },

    async create(name) {
      const now = new Date().toISOString();
      const created = {
        id: nextId++,
        name,
        createdAt: now,
        updatedAt: now,
      } satisfies GatheringSpot;
      spots = [...spots, created];
      return created;
    },

    async update(id, name) {
      const current = spots.find((spot) => spot.id === id);
      if (!current) throw new Error("集合場所が見つかりません。");

      const updated = {
        ...current,
        name,
        updatedAt: new Date().toISOString(),
      } satisfies GatheringSpot;
      spots = spots.map((spot) => (spot.id === id ? updated : spot));
      return updated;
    },

    async delete(id) {
      if (!spots.some((spot) => spot.id === id)) {
        throw new Error("集合場所が見つかりません。");
      }
      spots = spots.filter((spot) => spot.id !== id);
    },
  };
}
