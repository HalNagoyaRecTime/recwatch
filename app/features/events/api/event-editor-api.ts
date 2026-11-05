import type {
  EventEditValue,
  EventWriteInput,
} from "~/features/events/model/event-form";
import type { EventVenue } from "~/features/events/model/event-venue";

export type EventEditorApi = {
  create(input: EventWriteInput): Promise<{ id: number }>;
  get(eventId: number): Promise<EventEditValue>;
  listVenues(): Promise<EventVenue[]>;
  update(
    eventId: number,
    input: EventWriteInput,
    lockVersion: number
  ): Promise<void>;
};
