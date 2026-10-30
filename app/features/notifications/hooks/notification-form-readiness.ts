import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { validateNotificationDraft } from "~/features/notifications/model/notification-draft-validation";

/** 業務検証と取得状態から保存操作の可否を決める。 */
export function isNotificationFormReady(
  draft: NotificationDraft,
  detailOnly: boolean,
  resources: {
    configError: string | null;
    importanceOptions: readonly string[];
    isAudienceLoading: boolean;
    audienceError: string | null;
  }
): boolean {
  if (
    Object.keys(validateNotificationDraft(draft, new Date(), detailOnly))
      .length > 0
  )
    return false;
  if (detailOnly) return true;
  if (
    resources.configError ||
    !resources.importanceOptions.includes(draft.importance)
  )
    return false;
  return (
    !draft.audiences.some((audience) => audience.type !== "all") ||
    (!resources.isAudienceLoading && !resources.audienceError)
  );
}
