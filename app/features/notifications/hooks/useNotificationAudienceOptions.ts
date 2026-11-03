import { useEffect, useState } from "react";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import { getErrorMessage } from "~/lib/client-error";

export function useNotificationAudienceOptions(
  audienceApi: NotificationAudienceApi
) {
  const [reloadKey, setReloadKey] = useState(0);
  const [audienceResult, setAudienceResult] = useState<{
    api: NotificationAudienceApi;
    reloadKey: number;
    options: NotificationAudienceOption[];
    error: string | null;
  } | null>(null);
  useEffect(() => {
    let active = true;
    void audienceApi
      .load()
      .then((options) => {
        if (active)
          setAudienceResult({
            api: audienceApi,
            reloadKey,
            options,
            error: null,
          });
      })
      .catch((error: unknown) => {
        if (active)
          setAudienceResult({
            api: audienceApi,
            reloadKey,
            options: [],
            error: getErrorMessage(error),
          });
      });
    return () => {
      active = false;
    };
  }, [audienceApi, reloadKey]);

  const currentAudience =
    audienceResult?.api === audienceApi &&
    audienceResult.reloadKey === reloadKey
      ? audienceResult
      : null;
  return {
    audienceOptions: currentAudience?.options ?? [],
    audienceError: currentAudience?.error ?? null,
    isAudienceLoading: currentAudience === null,
    onAudienceReload: () => setReloadKey((current) => current + 1),
  };
}
