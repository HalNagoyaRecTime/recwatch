import { apiClient } from "~/lib/api-client";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";

import {
  toGatheringAudienceDtos,
  toNotificationAudienceOptions,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";

import {
  loadAllClassrooms,
  loadAllEvents,
  type NotificationAudienceHttpClient,
} from "./notification-audience-resource-loader";

type EventDetailDto = {
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

const INVALID_RESPONSE_MESSAGE =
  "通知対象の集合情報レスポンス形式が正しくありません。";

export function createHttpNotificationAudienceApi(
  client: NotificationAudienceHttpClient = apiClient
): NotificationAudienceApi {
  return {
    async load() {
      const [classrooms, events] = await Promise.all([
        loadAllClassrooms(client),
        loadAllEvents(client),
      ]);

      const eventDetails = await Promise.all(
        events.map(async (event) => ({
          event,
          detail: parseEventDetail(
            await client.get(`/api/v1/events/${event.event_id}`)
          ),
        }))
      );

      const gatheringsResponse = eventDetails.flatMap(
        ({ event, detail }) =>
          detail.rounds.flatMap((round) =>
            round.gatherings.map((gathering) => ({
              gathering_id: gathering.gathering_id,
              event_name: event.event_name,
              gathering_spot_name:
                gathering.gathering_spot.gathering_spot_name,
              gathering_time: gathering.gathering_time,
            }))
          )
      );

      return toNotificationAudienceOptions({
        classrooms,
        gatherings: toGatheringAudienceDtos(gatheringsResponse),
        events,
      });
    },
  };
}

export const httpNotificationAudienceApi =
  createHttpNotificationAudienceApi();

function parseEventDetail(value: unknown): EventDetailDto {
  if (!isRecord(value)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const rounds = value.rounds;

  if (
    !Array.isArray(rounds) ||
    !rounds.every(isRoundDto)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    rounds,
  };
}

function isRoundDto(value: unknown): value is RoundDto {
  return (
    isRecord(value) &&
    isPositiveInteger(value.round) &&
    Array.isArray(value.gatherings) &&
    value.gatherings.every(isEventGatheringDto)
  );
}

function isEventGatheringDto(
  value: unknown
): value is EventGatheringDto {
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
