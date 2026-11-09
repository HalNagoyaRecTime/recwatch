import type { Venue } from "~/features/venues/model/venue";

import type {
  VenueResponseDto,
  VenueWriteRequestDto,
} from "~/features/venues/api/dto/venue-api-dto";

export function toVenue(response: VenueResponseDto): Venue {
  return {
    id: response.venue_id,
    name: response.venue_name,
    imageUrl: response.image_url,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    lockVersion: response.lock_version,
  };
}

export function toVenueWriteRequest(
  name: string,
  lockVersion?: number
): VenueWriteRequestDto {
  return {
    venueName: name,
    ...(lockVersion === undefined ? {} : { lockVersion }),
  };
}
