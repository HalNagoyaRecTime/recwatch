import type { EventGatheringSettingsResponseDto } from "~/features/event-gatherings/api/dto/event-gathering-settings-api-dto";
import { toEventGatheringSettings } from "~/features/event-gatherings/api/mappers/event-gathering-settings-mappers";
import type { EventDetailGateway } from "~/features/sports/api/event-detail-gateway";
import type { EventDetail } from "~/features/sports/model/event-detail";
import { apiClient } from "~/lib/api-client";

type EventDetailApiClient = {
  get<T>(path: string): Promise<T>;
};

/**
 * GET /api/v1/events/:eventId のレスポンス。
 * Event 本体の項目に加えて、集合設定と同じ形の `rounds` を返す。
 */
type EventDetailDto = EventGatheringSettingsResponseDto & {
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
};

/** API は "HHMM" で返すため、画面表示用の "HH:mm" に揃える。 */
function formatTime(value: string): string {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

function toEventDetail(response: EventDetailDto): EventDetail {
  return {
    id: response.event_id,
    name: response.event_name,
    venue: response.venue,
    startTime: formatTime(response.start_time),
    endTime: formatTime(response.end_time),
    rules: response.rule_text,
    // Round / 集合の変換は集合設定と共通のマッパーに任せる
    rounds: toEventGatheringSettings(response).rounds,
  };
}

export function createHttpEventDetailGateway(
  client: EventDetailApiClient = apiClient
): EventDetailGateway {
  return {
    async load(eventId) {
      const response = await client.get<EventDetailDto>(
        `/api/v1/events/${eventId}`
      );
      return toEventDetail(response);
    },
  };
}

export const httpEventDetailGateway = createHttpEventDetailGateway();
