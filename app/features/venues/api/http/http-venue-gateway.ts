import type {
  VenueGateway,
  VenueListOptions,
} from "~/features/venues/api/contracts/venue-gateway";
import type {
  VenuePageResponseDto,
  VenueResponseDto,
} from "~/features/venues/api/dto/venue-api-dto";
import {
  toVenue,
  toVenueWriteRequest,
} from "~/features/venues/api/mappers/venue-mappers";

type VenueHttpClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
};

export function createHttpVenueGateway(client: VenueHttpClient): VenueGateway {
  return {
    async list(options?: VenueListOptions) {
      const params = new URLSearchParams();
      if (options?.limit !== undefined)
        params.set("limit", String(options.limit));
      if (options?.offset !== undefined)
        params.set("offset", String(options.offset));
      if (options?.name) params.set("name", options.name);
      if (options?.sort) {
        params.set("sortBy", toApiSortBy(options.sort.columnId));
        params.set("sortOrder", options.sort.direction);
      }

      const query = params.toString();
      // クエリなしのときは配列、クエリありのときはページ形式で返ってくる
      const response = await client.get<
        VenueResponseDto[] | VenuePageResponseDto
      >(`/api/v1/venues${query ? `?${query}` : ""}`);

      if (Array.isArray(response)) {
        const items = response.map(toVenue);
        return {
          items,
          total: items.length,
          limit: items.length,
          offset: 0,
        };
      }

      return {
        items: response.venues.map(toVenue),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      };
    },

    async create(name) {
      const response = await client.post<VenueResponseDto>(
        "/api/v1/venues",
        toVenueWriteRequest(name)
      );
      return toVenue(response);
    },

    async update(id, name) {
      const response = await client.put<VenueResponseDto>(
        `/api/v1/venues/${id}`,
        toVenueWriteRequest(name)
      );
      return toVenue(response);
    },

    async delete(id) {
      await client.delete(`/api/v1/venues/${id}`);
    },
  };
}

function toApiSortBy(
  columnId: NonNullable<VenueListOptions["sort"]>["columnId"]
): "id" | "name" | "createdAt" | "updatedAt" {
  if (columnId === "created-at") return "createdAt";
  if (columnId === "updated-at") return "updatedAt";
  return columnId;
}
