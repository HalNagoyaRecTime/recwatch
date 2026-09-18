import type { CompetitionListGateway } from "~/features/sports/api/competition-list-gateway";
import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";
import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

type CompetitionListApiClient = {
  delete(path: string): Promise<void>;
  get(path: string): Promise<unknown>;
};

type EventDto = {
  event_id: number;
  event_name: string;
  rule_text: string | null;
  venue: string;
  start_time: string;
  end_time: string;
};

type EventDetailDto = EventDto & {
  rounds: RoundDto[];
};

type RoundDto = {
  round: number;
  gatherings: EventGatheringDto[];
};

type EventGatheringDto = {
  gathering_id: number;
  gathering_time: string;
  gathering_spot: {
    gathering_spot_id: number;
    gathering_spot_name: string;
  };
  member_count: number;
};

type GatheringDto = {
  event_id: number;
  gathering_spot_name: string;
  gathering_time: string;
};

function parseEventPage(value: unknown): {
  events: EventDto[];
  total: number;
} {
  if (
    !isRecord(value) ||
    !Array.isArray(value.events) ||
    !isNonNegativeInteger(value.total) ||
    !value.events.every(isEventDto)
  ) {
    throw new Error("イベント一覧のレスポンス形式が正しくありません。");
  }

  return {
    events: value.events,
    total: value.total,
  };
}

function parseEventDetail(value: unknown): EventDetailDto {
  if (!isRecord(value)) {
    throw new Error("イベント詳細のレスポンス形式が正しくありません。");
  }

  const rounds = value.rounds;

  if (
    !isEventDto(value) ||
    !Array.isArray(rounds) ||
    !rounds.every(isRoundDto)
  ) {
    throw new Error("イベント詳細のレスポンス形式が正しくありません。");
  }

  return {
    event_id: value.event_id,
    event_name: value.event_name,
    rule_text: value.rule_text,
    venue: value.venue,
    start_time: value.start_time,
    end_time: value.end_time,
    rounds,
  };
}

function isEventDto(value: unknown): value is EventDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.event_id) &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    typeof value.venue === "string" &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

function isRoundDto(value: unknown): value is RoundDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.round) &&
    Number(value.round) > 0 &&
    Array.isArray(value.gatherings) &&
    value.gatherings.every(isEventGatheringDto)
  );
}

function isEventGatheringDto(value: unknown): value is EventGatheringDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_id) &&
    typeof value.gathering_time === "string" &&
    isGatheringSpotDto(value.gathering_spot) &&
    isNonNegativeInteger(value.member_count)
  );
}

function isGatheringSpotDto(
  value: unknown
): value is EventGatheringDto["gathering_spot"] {
  return (
    isRecord(value) &&
    isPositiveInteger(value.gathering_spot_id) &&
    typeof value.gathering_spot_name === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function formatTime(value: string): string {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value || "未設定";
}

function mapCompetition(
  event: EventDto,
  gatherings: readonly GatheringDto[]
): CompetitionListItem {
  const relatedGatherings = gatherings.filter(
    (gathering) => gathering.event_id === event.event_id
  );

  const meetingTimes = Array.from(
    new Set(
      relatedGatherings
        .map((gathering) => gathering.gathering_time)
        .filter((time) => time && time !== "99:59")
        .map(formatTime)
    )
  );

  const meetingPlaces = Array.from(
    new Set(
      relatedGatherings
        .map((gathering) => gathering.gathering_spot_name)
        .filter((name) => Boolean(name))
    )
  );

  return {
    id: event.event_id,
    code: String(event.event_id).padStart(3, "0"),
    name: event.event_name,
    venue: event.venue,
    meetingTime: meetingTimes.join("、") || "未設定",
    startTime: formatTime(event.start_time),
    endTime: formatTime(event.end_time),
    meetingPlace: meetingPlaces.join("、") || "未設定",
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

        return {
          items: page.events,
          total: page.total,
        };
      });

      const eventDetails = await Promise.all(
        events.map(async (event) =>
          parseEventDetail(
            await client.get(`/api/v1/events/${event.event_id}`)
          )
        )
      );

      const gatherings: GatheringDto[] = eventDetails.flatMap((event) =>
        event.rounds.flatMap((round) =>
          round.gatherings.map((gathering) => ({
            event_id: event.event_id,
            gathering_spot_name:
              gathering.gathering_spot.gathering_spot_name,
            gathering_time: gathering.gathering_time,
          }))
        )
      );

      return events.map((event) => mapCompetition(event, gatherings));
    },

    delete(eventId) {
      return client.delete(`/api/v1/events/${eventId}`);
    },
  };
}

export const httpCompetitionListGateway =
  createHttpCompetitionListGateway();
