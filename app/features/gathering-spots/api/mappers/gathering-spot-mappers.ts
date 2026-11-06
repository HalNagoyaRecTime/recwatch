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
    imageUrl: response.image_url,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    lockVersion: response.lock_version,
  };
}

export function toGatheringSpotWriteRequest(
  name: string,
  lockVersion?: number
): GatheringSpotWriteRequestDto {
  return {
    gatheringSpotName: name,
    ...(lockVersion === undefined ? {} : { lockVersion }),
  };
}
