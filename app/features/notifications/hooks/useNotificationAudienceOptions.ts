import { useEffect, useState } from "react";

import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import { getErrorMessage } from "~/lib/client-error";

type AudienceLoadState = {
  api: NotificationAudienceApi | null;
  error: string | null;
  options: NotificationAudienceOption[];
  reloadKey: number;
};

export function useNotificationAudienceOptions(
  audienceApi: NotificationAudienceApi
) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<AudienceLoadState>({
    api: null,
    error: null,
    options: [],
    reloadKey: -1,
  });

  useEffect(() => {
    let active = true;

    audienceApi
      .load()
      .then((options) => {
        if (!active) return;

        setState({
          api: audienceApi,
          error: null,
          options,
          reloadKey,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          api: audienceApi,
          error: getErrorMessage(error),
          options: [],
          reloadKey,
        });
      });

    return () => {
      active = false;
    };
  }, [audienceApi, reloadKey]);

  const isCurrent = state.api === audienceApi && state.reloadKey === reloadKey;

  return {
    audienceError: isCurrent ? state.error : null,
    audienceOptions: state.options,
    isAudienceLoading: !isCurrent,
    reloadAudience: () => setReloadKey((current) => current + 1),
  };
}
