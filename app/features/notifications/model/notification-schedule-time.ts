/** 通知の予約入力は日本時間の年月日時分として扱う。 */
const NOTIFICATION_OFFSET = "+09:00";
const NOTIFICATION_OFFSET_MS = 9 * 60 * 60 * 1_000;

export function toNotificationDateTimeInput(
  value: Date | string | undefined
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + NOTIFICATION_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}

export function parseNotificationScheduledAt(
  value: string | undefined
): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${NOTIFICATION_OFFSET}`);
  return !Number.isNaN(date.getTime()) &&
    toNotificationDateTimeInput(date) === value
    ? date
    : null;
}

export function toNotificationSendAt(value: string): string | null {
  return parseNotificationScheduledAt(value)
    ? `${value}:00${NOTIFICATION_OFFSET}`
    : null;
}

export function getMinimumNotificationSchedule(now: Date): string {
  return toNotificationDateTimeInput(new Date(now.getTime() + 60_000));
}
