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

export const notificationAudienceLoadingErrorMessages: Record<
  NotificationAudienceLoadingErrorKind,
  string
> = {
  authentication_required: "ログインが必要です。",
  forbidden: "通知対象を取得する権限がありません。",
  unexpected:
    "通知対象を取得できませんでした。時間をおいて再度お試しください。",
};
