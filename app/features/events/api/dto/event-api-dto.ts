import type { EventGatheringSettingsResponseDto } from "~/features/events/api/dto/event-gathering-settings-api-dto";

export type EventVenueResponseDto = {
  venue_id: number;
  venue_name: string;
};

/** Event GET系で共有する基本response。 */
export type EventResponseDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venues: EventVenueResponseDto[];
  start_time: string;
  end_time: string;
};

/** GET /api/v1/events の一覧項目。 */
export type EventListItemResponseDto = EventResponseDto & {
  gathering_summary: {
    gathering_count: number;
    configured_gathering_count: number;
    first_gathering_time: string | null;
  };
};

export type EventListResponseDto = {
  events: EventListItemResponseDto[];
  total: number;
  limit: number;
  offset: number;
};

/** GET /api/v1/events/:eventId の共通response。 */
export type EventDetailResponseDto = EventResponseDto &
  EventGatheringSettingsResponseDto;

export type EventWriteRequestDto = {
  event_name: string;
  rule_text: string | null;
  venue_ids: number[];
  start_time: string;
  end_time: string;
};
