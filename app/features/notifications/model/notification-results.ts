import type { NOTIFICATION_PUSH_DELIVERY_STATUSES } from "~/features/notifications/model/notification-values";
export type ResultStatus =
  "success" | "partial" | "failed" | "processing" | "stopped" | "no_target";
export type ResultFilters = {
  search: string;
  status: "all" | ResultStatus;
  platform: "all" | "ios" | "android";
};
export const defaultResultFilters: ResultFilters = {
  search: "",
  status: "all",
  platform: "all",
};
type ResultRecipient = {
  notificationRecipientId: number;
  user: { userId: number; userName: string };
  deliveries: {
    platform: "ios" | "android";
    status: (typeof NOTIFICATION_PUSH_DELIVERY_STATUSES)[number];
    lastAttemptAt: string | null;
    sentAt: string | null;
  }[];
};
export function getRecipientResult(recipient: ResultRecipient): ResultStatus {
  const values = recipient.deliveries.map((item) => item.status);
  if (!values.length) return "no_target";
  if (
    values.some((value) => ["pending", "sending", "retry_wait"].includes(value))
  )
    return "processing";
  if (values.every((value) => value === "sent")) return "success";
  if (values.includes("sent") && values.includes("failed")) return "partial";
  if (values.includes("failed")) return "failed";
  return "stopped";
}
export function filterRecipients<T extends ResultRecipient>(
  items: readonly T[],
  filters: ResultFilters
): T[] {
  const words = filters.search
    .trim()
    .toLocaleLowerCase("ja")
    .split(/\s+/)
    .filter(Boolean);
  return items.filter((item) => {
    const text =
      `${item.user.userName} ${item.user.userId} #${item.user.userId}`.toLocaleLowerCase(
        "ja"
      );
    return (
      words.every((word) => text.includes(word)) &&
      (filters.status === "all" ||
        filters.status === getRecipientResult(item)) &&
      (filters.platform === "all" ||
        item.deliveries.some(
          (delivery) => delivery.platform === filters.platform
        ))
    );
  });
}
export function lastRecipientAttempt(recipient: ResultRecipient) {
  return (
    recipient.deliveries
      .flatMap((item) => [item.sentAt, item.lastAttemptAt])
      .filter((value): value is string => !!value)
      .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null
  );
}
