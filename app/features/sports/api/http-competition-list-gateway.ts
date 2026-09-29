import type { CompetitionListGateway } from "~/features/sports/api/competition-list-gateway";
import type {
  CompetitionGatheringSummary,
  CompetitionListItem,
} from "~/features/sports/model/competition-list-item";
import type { CompetitionVenue } from "~/features/sports/model/competition-venue";
import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

type CompetitionListApiClient = {
  delete(path: string): Promise<void>;
  get(path: string): Promise<unknown>;
};

type GatheringSummaryDto = {
  gathering_count: number;
  configured_gathering_count: number;
  first_gathering_time: string | null;
};

type VenueDto = {
  venue_id: number;
  venue_name: string;
};

type EventDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venues: VenueDto[];
  start_time: string;
  end_time: string;
  gathering_summary: GatheringSummaryDto;
};

function parseEventPage(value: unknown): { events: EventDto[]; total: number } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("events" in value) ||
    !Array.isArray(value.events) ||
    !("total" in value) ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0 ||
    !value.events.every(isEventDto)
  ) {
    throw new Error("イベント一覧のレスポンス形式が正しくありません。");
  }
  return { events: value.events, total: Number(value.total) };
}

function isEventDto(value: unknown): value is EventDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.event_id) &&
    Number(value.event_id) > 0 &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    Array.isArray(value.venues) &&
    value.venues.every(isVenueDto) &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string" &&
    isGatheringSummaryDto(value.gathering_summary)
  );
}

function isVenueDto(value: unknown): value is VenueDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.venue_id) &&
    typeof value.venue_name === "string"
  );
}

function isGatheringSummaryDto(value: unknown): value is GatheringSummaryDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.gathering_count) &&
    Number(value.gathering_count) >= 0 &&
    Number.isSafeInteger(value.configured_gathering_count) &&
    Number(value.configured_gathering_count) >= 0 &&
    (value.first_gathering_time === null ||
      typeof value.first_gathering_time === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatTime(value: string): string {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value || "未設定";
}

function mapGatheringSummary(
  summary: GatheringSummaryDto
): CompetitionGatheringSummary {
  return {
    gatheringCount: summary.gathering_count,
    configuredGatheringCount: summary.configured_gathering_count,
    firstGatheringTime: summary.first_gathering_time,
  };
}

function mapVenue(venue: VenueDto): CompetitionVenue {
  return { id: venue.venue_id, name: venue.venue_name };
}

function mapCompetition(event: EventDto): CompetitionListItem {
  return {
    id: event.event_id,
    code: String(event.event_id).padStart(3, "0"),
    name: event.event_name,
    venues: event.venues.map(mapVenue),
    startTime: formatTime(event.start_time),
    endTime: formatTime(event.end_time),
    gatheringSummary: mapGatheringSummary(event.gathering_summary),
    rules: event.rule_text ?? "ルール未設定",
  };
}

export function createHttpCompetitionListGateway(
  client: CompetitionListApiClient = apiClient
): CompetitionListGateway {
  return {
    async load() {
      const events = await loadAllPages(async (offset, limit) => {
        const page = parseEventPage(
          await client.get(`/api/v1/events?limit=${limit}&offset=${offset}`)
        );
        return { items: page.events, total: page.total };
      });

      return events.map(mapCompetition);
    },
    delete(eventId) {
      return client.delete(`/api/v1/events/${eventId}`);
    },
  };
}

export const httpCompetitionListGateway = createHttpCompetitionListGateway();
