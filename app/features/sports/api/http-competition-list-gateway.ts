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

type GatheringDto = {
  event_id: number;
  gathering_spot_name?: string;
  gathering_time: string;
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

function assertGatherings(value: unknown): asserts value is GatheringDto[] {
  if (!Array.isArray(value) || !value.every(isGatheringDto)) {
    throw new Error("集合情報のレスポンス形式が正しくありません。");
  }
}

function isEventDto(value: unknown): value is EventDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.event_id) &&
    Number(value.event_id) > 0 &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    typeof value.venue === "string" &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

function isGatheringDto(value: unknown): value is GatheringDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.event_id) &&
    Number(value.event_id) > 0 &&
    typeof value.gathering_time === "string" &&
    (value.gathering_spot_name === undefined ||
      typeof value.gathering_spot_name === "string")
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
        .filter((name): name is string => Boolean(name))
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
      const [events, gatherings] = await Promise.all([
        loadAllPages(async (offset, limit) => {
          const page = parseEventPage(
            await client.get(`/api/v1/events?limit=${limit}&offset=${offset}`)
          );
          return { items: page.events, total: page.total };
        }),
        client.get("/api/v1/gatherings"),
      ]);
      assertGatherings(gatherings);

      return events.map((event) => mapCompetition(event, gatherings));
    },
    delete(eventId) {
      return client.delete(`/api/v1/events/${eventId}`);
    },
  };
}

export const httpCompetitionListGateway = createHttpCompetitionListGateway();
