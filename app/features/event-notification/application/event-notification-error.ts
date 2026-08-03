export type EventNotificationErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unexpected";

export class EventNotificationError extends Error {
  constructor(public readonly kind: EventNotificationErrorKind) {
    super(kind);
    this.name = "EventNotificationError";
  }
}
