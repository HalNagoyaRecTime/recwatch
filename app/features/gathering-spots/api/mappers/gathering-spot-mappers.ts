import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

import type {
  GatheringSpotResponseDto,
  GatheringSpotWriteRequestDto,
} from "~/features/gathering-spots/api/dto/gathering-spot-api-dto";

export function toGatheringSpot(
  response: GatheringSpotResponseDto
): GatheringSpot {
  return {
    id: response.gathering_spot_id,
    name: response.gathering_spot_name,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
}

export function toGatheringSpotWriteRequest(
  name: string
): GatheringSpotWriteRequestDto {
  return { gatheringSpotName: name };
}
