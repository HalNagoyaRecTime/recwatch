import type { EventQueryGateway } from "~/features/events/api/contracts/event-query-gateway";
import type {
  EventDetailResponseDto,
  EventListItemResponseDto,
  EventListResponseDto,
} from "~/features/events/api/dto/event-api-dto";
import {
  toEventDetail,
  toEventListItem,
} from "~/features/events/api/mappers/event-mappers";
import { apiClient } from "~/lib/api-client";
import { loadAllPages } from "~/lib/load-all-pages";

type EventQueryHttpClient = {
  get(path: string): Promise<unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVenue(value: unknown): boolean {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.venue_id) &&
    Number(value.venue_id) > 0 &&
    typeof value.venue_name === "string"
  );
}

function isGatheringSummary(value: unknown): boolean {
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

function isEventBase(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.event_id) &&
    Number(value.event_id) > 0 &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    Array.isArray(value.venues) &&
    value.venues.every(isVenue) &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

function isEventListItem(value: unknown): value is EventListItemResponseDto {
  return isEventBase(value) && isGatheringSummary(value.gathering_summary);
}

function parseEventListPage(value: unknown): EventListResponseDto {
  if (
    !isRecord(value) ||
    !Array.isArray(value.events) ||
    !value.events.every(isEventListItem) ||
    !Number.isSafeInteger(value.total) ||
    Number(value.total) < 0 ||
    !Number.isSafeInteger(value.limit) ||
    Number(value.limit) < 0 ||
    !Number.isSafeInteger(value.offset) ||
    Number(value.offset) < 0
  ) {
    throw new Error("イベント一覧のレスポンス形式が正しくありません。");
  }

  return {
    events: value.events,
    total: Number(value.total),
    limit: Number(value.limit),
    offset: Number(value.offset),
  };
}

function isGatheringSetting(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const spot = value.gathering_spot;
  return (
    Number.isSafeInteger(value.gathering_id) &&
    Number(value.gathering_id) > 0 &&
    typeof value.gathering_time === "string" &&
    isRecord(spot) &&
    Number.isSafeInteger(spot.gathering_spot_id) &&
    Number(spot.gathering_spot_id) > 0 &&
    typeof spot.gathering_spot_name === "string" &&
    Number.isSafeInteger(value.member_count) &&
    Number(value.member_count) >= 0
  );
}

function parseEventDetail(value: unknown): EventDetailResponseDto {
  if (
    !isEventBase(value) ||
    !Array.isArray(value.rounds) ||
    !value.rounds.every(
      (round) =>
        isRecord(round) &&
        Number.isSafeInteger(round.round) &&
        Array.isArray(round.gatherings) &&
        round.gatherings.every(isGatheringSetting)
    )
  ) {
    throw new Error("イベント詳細のレスポンス形式が正しくありません。");
  }

  return value as unknown as EventDetailResponseDto;
}

export function createHttpEventQueryGateway(
  client: EventQueryHttpClient = apiClient
): EventQueryGateway {
  return {
    async list() {
      const events = await loadAllPages(async (offset, limit) => {
        const page = parseEventListPage(
          await client.get(`/api/v1/events?limit=${limit}&offset=${offset}`)
        );
        return { items: page.events, total: page.total };
      });

      return events.map(toEventListItem);
    },
    async get(eventId) {
      const response = parseEventDetail(
        await client.get(`/api/v1/events/${eventId}`)
      );
      return toEventDetail(response);
    },
  };
}

export const httpEventQueryGateway = createHttpEventQueryGateway();
