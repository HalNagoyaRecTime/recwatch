import type {
  GatheringSpotGateway,
  GatheringSpotListOptions,
} from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type {
  GatheringSpotPageResponseDto,
  GatheringSpotResponseDto,
} from "~/features/gathering-spots/api/dto/gathering-spot-api-dto";
import {
  toGatheringSpot,
  toGatheringSpotWriteRequest,
} from "~/features/gathering-spots/api/mappers/gathering-spot-mappers";

type GatheringSpotHttpClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
};

export function createHttpGatheringSpotGateway(
  client: GatheringSpotHttpClient
): GatheringSpotGateway {
  return {
    async list(options?: GatheringSpotListOptions) {
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
      const response = await client.get<
        GatheringSpotResponseDto[] | GatheringSpotPageResponseDto
      >(`/api/v1/gathering-spots${query ? `?${query}` : ""}`);

      if (Array.isArray(response)) {
        const items = response.map(toGatheringSpot);
        return {
          items,
          total: items.length,
          limit: items.length,
          offset: 0,
        };
      }

      return {
        items: response.gathering_spots.map(toGatheringSpot),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      };
    },

    async getById(id) {
      const response = await client.get<GatheringSpotResponseDto>(
        `/api/v1/gathering-spots/${id}`
      );
      return toGatheringSpot(response);
    },

    async create(name) {
      const response = await client.post<GatheringSpotResponseDto>(
        "/api/v1/gathering-spots",
        toGatheringSpotWriteRequest(name)
      );
      return toGatheringSpot(response);
    },

    async update(id, name) {
      const response = await client.put<GatheringSpotResponseDto>(
        `/api/v1/gathering-spots/${id}`,
        toGatheringSpotWriteRequest(name)
      );
      return toGatheringSpot(response);
    },

    async delete(id) {
      await client.delete(`/api/v1/gathering-spots/${id}`);
    },
  };
}

function toApiSortBy(
  columnId: NonNullable<GatheringSpotListOptions["sort"]>["columnId"]
): "id" | "name" | "createdAt" | "updatedAt" {
  if (columnId === "created-at") return "createdAt";
  if (columnId === "updated-at") return "updatedAt";
  return columnId;
}
