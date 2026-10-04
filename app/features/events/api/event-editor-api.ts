import type {
  EventFormValue,
  EventWriteInput,
} from "~/features/events/model/event-form";
import type { EventVenue } from "~/features/events/model/event-venue";

export type EventEditorApi = {
  create(input: EventWriteInput): Promise<{ id: number }>;
  get(eventId: number): Promise<EventFormValue>;
  listVenues(): Promise<EventVenue[]>;
  update(eventId: number, input: EventWriteInput): Promise<void>;
};
