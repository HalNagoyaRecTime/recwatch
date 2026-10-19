import type { NotificationValidationDetailsDto } from "~/features/notifications/api/dto/notification-error-dto";
import type { NotificationDraftErrors } from "~/features/notifications/model/notification-draft-validation";

const fieldByApiKey = new Map<string, keyof NotificationDraftErrors>([
  ["content.push.title", "title"],
  ["content.push.body", "body"],
  ["content.detail.title", "detailTitle"],
  ["content.detail.body", "detailBody"],
  ["title", "title"],
  ["body", "body"],
  ["audience", "audiences"],
  ["delivery", "scheduledAt"],
  ["importance", "importance"],
]);
// flatten()のcontent / scheduleは対象欄を特定できないため、フォーム内でまとめて表示します。
const groupLabels = new Map([
  ["content", "通知内容"],
  ["schedule", "通知対象・配信日時"],
]);
export function toNotificationDraftErrors(
  details: NotificationValidationDetailsDto
) {
  const fieldErrors: NotificationDraftErrors = {};
  const formErrors = [...details.formErrors];
  for (const [key, messages] of Object.entries(details.fieldErrors)) {
    const field = fieldByApiKey.get(key);
    if (field && messages[0]) fieldErrors[field] ??= messages[0];
    else
      formErrors.push(
        ...messages.map((message) =>
          groupLabels.has(key) ? `${groupLabels.get(key)}: ${message}` : message
        )
      );
  }
  return { fieldErrors, formErrors };
}
