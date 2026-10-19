import type { EventListItem } from "~/features/events/model/event-list-item";

export type EventListGateway = {
  delete(eventId: number): Promise<void>;
  load(): Promise<EventListItem[]>;
};
