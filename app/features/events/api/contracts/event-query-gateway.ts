import type { EventDetail } from "~/features/events/model/event-detail";
import type { EventListItem } from "~/features/events/model/event-list-item";

export interface EventQueryGateway {
  list(): Promise<EventListItem[]>;
  get(eventId: number): Promise<EventDetail>;
}
