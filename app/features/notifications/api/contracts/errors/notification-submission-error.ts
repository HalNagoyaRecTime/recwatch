export type NotificationSubmissionErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "audience_not_found"
  | "no_active_devices"
  | "unexpected";

export class NotificationSubmissionError extends Error {
  constructor(public readonly kind: NotificationSubmissionErrorKind) {
    super(kind);
    this.name = "NotificationSubmissionError";
  }
}
