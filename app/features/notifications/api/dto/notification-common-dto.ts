export type NotificationScheduleStatusDto =
  "scheduled" | "resolving" | "sending" | "completed" | "failed" | "stopped";

export type NotificationPushDeliveryStatusDto =
  "pending" | "sending" | "retry_wait" | "sent" | "failed" | "stopped";

export type NotificationImportanceDto = "low" | "normal" | "high";

export type NotificationPlatformDto = "ios" | "android";

export type NotificationUserReferenceDto = {
  userId: number;
  userName: string;
};

export type NotificationPushContentDto = {
  title: string;
  body: string;
};

export type NotificationContentDto = {
  push: NotificationPushContentDto;
  detail: {
    title: string;
    body: string;
  };
};

export type NotificationAudienceInputItemDto =
  | { type: "all" }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
    };

export type NotificationAudienceItemDto =
  | { type: "all" }
  | {
      type: "class_room" | "gathering" | "event" | "user";
      targetId: number;
      label: string | null;
    };

export type NotificationAudienceInputDto = {
  items: NotificationAudienceInputItemDto[];
};

export type NotificationAudienceDto = {
  items: NotificationAudienceItemDto[];
  recipientResolution: {
    status: "pending" | "resolved";
    resolvedCount: number;
  };
};

export type NotificationDeliveryInputDto =
  { type: "immediate"; sendAt: null } | { type: "scheduled"; sendAt: string };

export type NotificationCreationDto =
  | {
      method: "manual";
      user: NotificationUserReferenceDto | null;
      source: null;
    }
  | {
      method: "automatic";
      user: null;
      source: {
        type: "gathering";
        id: number;
        label: string | null;
      };
    };

export type NotificationStopDto = {
  reason: "manual" | "source_deleted";
  stoppedAt: string;
  stoppedBy: NotificationUserReferenceDto | null;
};

export type NotificationRecipientPushSummaryDto = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  noPushTargetCount: number;
};

export type NotificationDateRangeQueryDto =
  { from?: undefined; to?: undefined } | { from: string; to: string };
