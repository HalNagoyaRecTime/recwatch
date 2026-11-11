import type { NotificationValidationDetails } from "~/features/notifications/api/contracts/notification-error";
import type {
  NotificationDraftField,
  NotificationDraftIssue,
  NotificationDraftIssues,
} from "~/features/notifications/model/notification-draft-validation";

export type NotificationFieldError =
  | { kind: "validation"; code: NotificationDraftIssue }
  | { kind: "api"; message: string };
export type NotificationFormErrors = Partial<
  Record<NotificationDraftField, NotificationFieldError>
>;
export type NotificationFormIssue = { field: string | null; message: string };

export function toNotificationValidationErrors(
  issues: NotificationDraftIssues
): NotificationFormErrors {
  const errors: NotificationFormErrors = {};
  for (const field of Object.keys(issues) as NotificationDraftField[]) {
    const code = issues[field];
    if (code) errors[field] = { kind: "validation", code };
  }
  return errors;
}

const fieldByApiKey = new Map<string, NotificationDraftField>([
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
export function toNotificationFormErrors(
  details: NotificationValidationDetails
) {
  const fieldErrors: NotificationFormErrors = {};
  const formErrors: NotificationFormIssue[] = details.formErrors.map(
    (message) => ({ field: null, message })
  );
  for (const [key, messages] of Object.entries(details.fieldErrors)) {
    const field = fieldByApiKey.get(key);
    if (field && messages[0])
      fieldErrors[field] ??= { kind: "api", message: messages[0] };
    else
      formErrors.push(...messages.map((message) => ({ field: key, message })));
  }
  return { fieldErrors, formErrors };
}
