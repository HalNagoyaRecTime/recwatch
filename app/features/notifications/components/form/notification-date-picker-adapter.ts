import { parseNotificationScheduledAt } from "~/features/notifications/model/notification-schedule-time";

/** DatePickerのDateは、入力された年月日時分を表示するためだけに使う。 */
export function toNotificationPickerDate(
  value: string | undefined
): Date | null {
  if (!parseNotificationScheduledAt(value)) return null;
  return new Date(value!);
}

export function fromNotificationPickerDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
