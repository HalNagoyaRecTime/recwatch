import type { EventNotificationGateway } from "../application/event-notification-gateway";
import type { EventPatch } from "../model/event-notification";
import { toEventNotificationError } from "./event-notification-error-mapper";
import {
  toEventNotificationSummary,
  toEventPatchResult,
} from "./event-notification-response-mapper";
import { toPatchEventRequest } from "./event-patch-request-mapper";

export type EventNotificationHttpClient = {
  get(path: string): Promise<unknown>;
  patch(path: string, body: unknown): Promise<unknown>;
};

export function createHttpEventNotificationGateway(
  client: EventNotificationHttpClient
): EventNotificationGateway {
  return {
    async patchEvent(patch: EventPatch) {
      try {
        return toEventPatchResult(
          await client.patch(
            `/api/v1/events/${patch.eventId}`,
            toPatchEventRequest(patch)
          )
        );
      } catch (error) {
        throw toEventNotificationError(error);
      }
    },

    async getNotificationSummary(eventId) {
      try {
        return toEventNotificationSummary(
          await client.get(`/api/v1/events/${eventId}/notification-summary`)
        );
      } catch (error) {
        throw toEventNotificationError(error);
      }
    },
  };
}
