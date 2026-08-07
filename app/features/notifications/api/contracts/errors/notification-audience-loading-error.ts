export type NotificationAudienceLoadingErrorKind =
  | "authentication_required"
  | "forbidden"
  | "unexpected";

export class NotificationAudienceLoadingError extends Error {
  constructor(
    public readonly kind: NotificationAudienceLoadingErrorKind,
    options?: ErrorOptions
  ) {
    super(kind, options);
    this.name = "NotificationAudienceLoadingError";
  }
}
