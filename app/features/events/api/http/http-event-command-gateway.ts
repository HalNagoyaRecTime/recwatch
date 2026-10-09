import type { EventCommandGateway } from "~/features/events/api/contracts/event-command-gateway";
import type { EventResponseDto } from "~/features/events/api/dto/event-api-dto";
import { toEventWriteRequest } from "~/features/events/api/mappers/event-mappers";
import { apiClient } from "~/lib/api-client";

type EventCommandHttpClient = {
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEventResponse(value: unknown): value is EventResponseDto {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.event_id) &&
    Number(value.event_id) > 0 &&
    typeof value.event_name === "string" &&
    (value.rule_text === null || typeof value.rule_text === "string") &&
    Array.isArray(value.venues) &&
    value.venues.every(
      (venue) =>
        isRecord(venue) &&
        Number.isSafeInteger(venue.venue_id) &&
        Number(venue.venue_id) > 0 &&
        typeof venue.venue_name === "string"
    ) &&
    typeof value.start_time === "string" &&
    typeof value.end_time === "string"
  );
}

function parseEventResponse(value: unknown): EventResponseDto {
  if (!isEventResponse(value)) {
    throw new Error("イベント保存のレスポンス形式が正しくありません。");
  }
  return value;
}

export function createHttpEventCommandGateway(
  client: EventCommandHttpClient = apiClient
): EventCommandGateway {
  return {
    async create(input) {
      const response = parseEventResponse(
        await client.post<unknown>("/api/v1/events", toEventWriteRequest(input))
      );
      return { id: response.event_id };
    },
    async update(eventId, input) {
      parseEventResponse(
        await client.put<unknown>(
          `/api/v1/events/${eventId}`,
          toEventWriteRequest(input)
        )
      );
    },
    delete(eventId) {
      return client.delete(`/api/v1/events/${eventId}`);
    },
  };
}

export const httpEventCommandGateway = createHttpEventCommandGateway();
