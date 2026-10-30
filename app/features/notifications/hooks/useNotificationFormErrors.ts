import {
  toNotificationValidationErrors,
  type NotificationFormErrors,
} from "~/features/notifications/hooks/notification-form-errors";
import { useState } from "react";

import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { validateNotificationAudiences } from "~/features/notifications/model/notification-draft-validation";

/** 入力が変更された項目のエラーを消し、対象の検証を更新する。 */
export function useNotificationFormErrors() {
  const [errors, setErrors] = useState<NotificationFormErrors>({});
  function updateDraftErrors(nextDraft: NotificationDraft) {
    setErrors((current) => {
      const nextErrors: NotificationFormErrors = { ...current };
      for (const field of [
        "title",
        "body",
        "detailTitle",
        "detailBody",
      ] as const) {
        if (nextDraft[field].trim()) delete nextErrors[field];
      }
      if (nextDraft.scheduledAt || nextDraft.deliveryTiming !== "scheduled")
        delete nextErrors.scheduledAt;
      if (nextDraft.audiences.length) delete nextErrors.audiences;
      for (const key of Object.keys(current)) {
        if (key.startsWith("audiences."))
          delete nextErrors[key as keyof NotificationFormErrors];
      }
      if (
        Object.keys(current).some(
          (key) => key === "audiences" || key.startsWith("audiences.")
        )
      ) {
        Object.assign(
          nextErrors,
          toNotificationValidationErrors(
            validateNotificationAudiences(nextDraft.audiences)
          )
        );
      }
      return nextErrors;
    });
  }
  return { errors, setErrors, updateDraftErrors };
}
