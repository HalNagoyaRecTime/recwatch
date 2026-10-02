import type {
  EventDetailResponseDto,
  EventListItemResponseDto,
  EventWriteRequestDto,
} from "~/features/events/api/dto/event-api-dto";
import { toEventGatheringSettings } from "~/features/events/api/mappers/event-gathering-settings-mappers";
import type { EventDetail } from "~/features/events/model/event-detail";
import type { EventWriteInput } from "~/features/events/model/event-form";
import type { EventListItem } from "~/features/events/model/event-list-item";

/** BackendのHHMMをPresentation/DomainのHH:mmへ変換する唯一のEvent time mapper。 */
export function formatEventTime(value: string): string {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

export function toEventWriteRequest(
  input: EventWriteInput
): EventWriteRequestDto {
  return {
    event_name: input.name,
    rule_text: input.rules,
    venue_ids: [...input.venueIds],
    start_time: input.startTime.replace(":", ""),
    end_time: input.endTime.replace(":", ""),
  };
}

export function toEventListItem(
  response: EventListItemResponseDto
): EventListItem {
  return {
    id: response.event_id,
    code: String(response.event_id).padStart(3, "0"),
    name: response.event_name,
    venues: response.venues.map((venue) => ({
      id: venue.venue_id,
      name: venue.venue_name,
    })),
    startTime: formatEventTime(response.start_time),
    endTime: formatEventTime(response.end_time),
    gatheringSummary: {
      gatheringCount: response.gathering_summary.gathering_count,
      configuredGatheringCount:
        response.gathering_summary.configured_gathering_count,
      firstGatheringTime:
        response.gathering_summary.first_gathering_time === null
          ? null
          : formatEventTime(response.gathering_summary.first_gathering_time),
    },
    rules: response.rule_text ?? "ルール未設定",
  };
}

export function toEventDetail(response: EventDetailResponseDto): EventDetail {
  return {
    id: response.event_id,
    name: response.event_name,
    venues: response.venues.map((venue) => ({
      id: venue.venue_id,
      name: venue.venue_name,
    })),
    startTime: formatEventTime(response.start_time),
    endTime: formatEventTime(response.end_time),
    rules: response.rule_text,
    rounds: toEventGatheringSettings(response).rounds,
  };
}
