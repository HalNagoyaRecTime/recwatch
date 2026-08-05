import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpotResponseDto } from "~/features/gathering-spots/api/dto/gathering-spot-api-dto";
import {
  toGatheringSpot,
  toGatheringSpotWriteRequest,
} from "~/features/gathering-spots/api/mappers/gathering-spot-mappers";

type GatheringSpotHttpClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

export function createHttpGatheringSpotGateway(
  client: GatheringSpotHttpClient
): GatheringSpotGateway {
  return {
    async list() {
      const response = await client.get<GatheringSpotResponseDto[]>(
        "/api/v1/gathering-spots"
      );
      return response.map(toGatheringSpot);
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
  };
}
