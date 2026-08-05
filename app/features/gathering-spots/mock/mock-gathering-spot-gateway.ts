import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

export function createMockGatheringSpotGateway(
  initialSpots: GatheringSpot[] = []
): GatheringSpotGateway {
  let spots = [...initialSpots];
  let nextId = spots.reduce((maxId, spot) => Math.max(maxId, spot.id), 0) + 1;

  return {
    async list() {
      return [...spots];
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
  };
}
