export type NotificationManagementErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unexpected";

export class NotificationManagementError extends Error {
  constructor(public readonly kind: NotificationManagementErrorKind) {
    super(kind);
    this.name = "NotificationManagementError";
  }
}
