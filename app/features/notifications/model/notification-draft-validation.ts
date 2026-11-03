import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { parseNotificationScheduledAt } from "~/features/notifications/model/notification-schedule-time";

export type NotificationDraftField =
  keyof NotificationDraft | `audiences.${number}`;
export type NotificationDraftIssue =
  | "detail_title_required"
  | "detail_body_required"
  | "title_required"
  | "body_required"
  | "schedule_required"
  | "schedule_invalid"
  | "schedule_not_future"
  | "audience_required"
  | "audience_target_required"
  | "audience_duplicate"
  | "audience_all_exclusive";
export type NotificationDraftIssues = Partial<
  Record<NotificationDraftField, NotificationDraftIssue>
>;

export function validateNotificationDraft(
  draft: NotificationDraft,
  now = new Date(),
  detailOnly = false
): NotificationDraftIssues {
  const errors: NotificationDraftIssues = {};

  if (!draft.detailTitle.trim()) {
    errors.detailTitle = "detail_title_required";
  }

  if (!draft.detailBody.trim()) {
    errors.detailBody = "detail_body_required";
  }

  if (detailOnly) return errors;

  if (!draft.title.trim()) {
    errors.title = "title_required";
  }

  if (!draft.body.trim()) {
    errors.body = "body_required";
  }

  Object.assign(errors, validateNotificationAudiences(draft.audiences));

  if (draft.deliveryTiming === "scheduled") {
    if (!draft.scheduledAt) {
      errors.scheduledAt = "schedule_required";
    } else {
      const scheduledAt = parseNotificationScheduledAt(draft.scheduledAt);

      if (!scheduledAt) {
        errors.scheduledAt = "schedule_invalid";
      } else if (scheduledAt <= now) {
        errors.scheduledAt = "schedule_not_future";
      }
    }
  }

  return errors;
}

export function validateNotificationAudiences(
  audiences: NotificationDraft["audiences"]
): NotificationDraftIssues {
  const errors: NotificationDraftIssues = {};
  if (audiences.length === 0) errors.audiences = "audience_required";
  const seen = new Set<string>();
  audiences.forEach((audience, index) => {
    const targetId = Number(audience.targetId);
    if (
      audience.type !== "all" &&
      (!Number.isSafeInteger(targetId) || targetId <= 0)
    ) {
      errors[`audiences.${index}`] = "audience_target_required";
      return;
    }
    const key =
      audience.type === "all" ? "all" : `${audience.type}:${targetId}`;
    if (seen.has(key)) errors[`audiences.${index}`] = "audience_duplicate";
    seen.add(key);
  });
  if (
    audiences.some((audience) => audience.type === "all") &&
    audiences.length > 1
  )
    errors.audiences = "audience_all_exclusive";
  return errors;
}
