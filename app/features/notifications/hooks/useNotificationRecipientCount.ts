import { useEffect, useState } from "react";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import { toNotificationAudienceInput } from "~/features/notifications/hooks/notification-request-mapping";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { validateNotificationAudiences } from "~/features/notifications/model/notification-draft-validation";
import { getErrorMessage } from "~/lib/client-error";

export function useNotificationRecipientCount(
  configApi: NotificationConfigApi,
  audiences: NotificationDraft["audiences"],
  countEnabled: boolean
) {
  const [countResult, setCountResult] = useState<{
    api: NotificationConfigApi;
    audiences: NotificationDraft["audiences"];
    count: number | null;
    error: string | null;
  } | null>(null);

  const canCount =
    countEnabled &&
    Object.keys(validateNotificationAudiences(audiences)).length === 0;
  useEffect(() => {
    if (!canCount) return;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      void configApi
        .getAudienceCount({ audience: toNotificationAudienceInput(audiences) })
        .then((result) => {
          if (active)
            setCountResult({
              api: configApi,
              audiences,
              count: result.recipientCount,
              error: null,
            });
        })
        .catch((error: unknown) => {
          if (active)
            setCountResult({
              api: configApi,
              audiences,
              count: null,
              error: getErrorMessage(error),
            });
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [audiences, canCount, configApi]);

  const currentCount =
    canCount &&
    countResult?.api === configApi &&
    countResult.audiences === audiences
      ? countResult
      : null;
  return {
    recipientCount: currentCount?.count ?? null,
    recipientCountError: currentCount?.error ?? null,
    isRecipientCountLoading: canCount && currentCount === null,
  };
}
