import type {
  EventNotificationSummary,
  EventPatch,
  EventPatchResult,
} from "../model/event-notification";

export interface EventNotificationGateway {
  patchEvent(patch: EventPatch): Promise<EventPatchResult>;
  getNotificationSummary(eventId: number): Promise<EventNotificationSummary>;
}
