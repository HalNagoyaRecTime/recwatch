import type {
  VenueGateway,
  VenueListOptions,
} from "~/features/venues/api/contracts/venue-gateway";
import type { Venue } from "~/features/venues/model/venue";

export function createMockVenueGateway(
  initialVenues: Venue[] = []
): VenueGateway {
  let venues = [...initialVenues];
  let nextId =
    venues.reduce((maxId, venue) => Math.max(maxId, venue.id), 0) + 1;

  return {
    async list(options?: VenueListOptions) {
      const query = options?.name?.trim().toLowerCase();
      const filtered = query
        ? venues.filter((venue) => venue.name.toLowerCase().includes(query))
        : venues;
      const { columnId, direction } = options?.sort ?? {
        columnId: "id",
        direction: "asc",
      };
      const collator = new Intl.Collator("ja", {
        numeric: true,
        sensitivity: "base",
      });
      const sorted = [...filtered].sort((left, right) => {
        const result =
          columnId === "id"
            ? left.id - right.id
            : columnId === "name"
              ? collator.compare(left.name, right.name)
              : columnId === "created-at"
                ? collator.compare(left.createdAt, right.createdAt)
                : collator.compare(left.updatedAt, right.updatedAt);
        return direction === "asc" ? result : -result;
      });
      const limit = options?.limit ?? filtered.length;
      const offset = options?.offset ?? 0;
      return {
        items: sorted.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      };
    },

    async create(name) {
      const now = new Date().toISOString();
      const created = {
        id: nextId++,
        name,
        createdAt: now,
        updatedAt: now,
      } satisfies Venue;
      venues = [...venues, created];
      return created;
    },

    async update(id, name) {
      const current = venues.find((venue) => venue.id === id);
      if (!current) throw new Error("実施場所が見つかりません。");

      const updated = {
        ...current,
        name,
        updatedAt: new Date().toISOString(),
      } satisfies Venue;
      venues = venues.map((venue) => (venue.id === id ? updated : venue));
      return updated;
    },

    async delete(id) {
      if (!venues.some((venue) => venue.id === id)) {
        throw new Error("実施場所が見つかりません。");
      }
      venues = venues.filter((venue) => venue.id !== id);
    },
  };
}
