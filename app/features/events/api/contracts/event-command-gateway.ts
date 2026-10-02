import type { EventWriteInput } from "~/features/events/model/event-form";

export interface EventCommandGateway {
  create(input: EventWriteInput): Promise<{ id: number }>;
  update(eventId: number, input: EventWriteInput): Promise<void>;
  delete(eventId: number): Promise<void>;
}
