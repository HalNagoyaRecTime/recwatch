export const NOTIFICATION_SCHEDULE_STATUSES = [
  "scheduled",
  "resolving",
  "sending",
  "completed",
  "failed",
  "stopped",
] as const;

export const NOTIFICATION_PUSH_DELIVERY_STATUSES = [
  "pending",
  "sending",
  "retry_wait",
  "sent",
  "failed",
  "stopped",
] as const;

export const NOTIFICATION_IMPORTANCE_LEVELS = [
  "low",
  "normal",
  "high",
] as const;

export const DEFAULT_NOTIFICATION_IMPORTANCE = "normal" as const;

export const NOTIFICATION_PLATFORMS = ["ios", "android"] as const;

export const NOTIFICATION_TARGET_AUDIENCE_TYPES = [
  "class_room",
  "gathering",
  "event",
  "user",
] as const;

export const NOTIFICATION_AUDIENCE_TYPES = [
  "all",
  ...NOTIFICATION_TARGET_AUDIENCE_TYPES,
] as const;

export const NOTIFICATION_RECIPIENT_RESOLUTION_STATUSES = [
  "pending",
  "resolved",
] as const;

export const NOTIFICATION_DELIVERY_TYPES = ["immediate", "scheduled"] as const;

export const NOTIFICATION_CREATION_METHODS = ["manual", "automatic"] as const;

export const NOTIFICATION_SOURCE_TYPES = ["gathering"] as const;

export const NOTIFICATION_STOP_REASONS = ["manual", "source_deleted"] as const;
