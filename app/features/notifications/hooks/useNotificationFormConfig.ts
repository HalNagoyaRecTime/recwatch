import { useEffect, useState } from "react";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import type { NotificationConfig } from "~/features/notifications/api/contracts/admin-notification-types";
import { getErrorMessage } from "~/lib/client-error";

export function useNotificationFormConfig(configApi: NotificationConfigApi) {
  const [configResult, setConfigResult] = useState<{
    api: NotificationConfigApi;
    config: NotificationConfig | null;
    error: string | null;
  } | null>(null);
  useEffect(() => {
    let active = true;
    void configApi
      .getConfig()
      .then((config) => {
        if (active) setConfigResult({ api: configApi, config, error: null });
      })
      .catch((error: unknown) => {
        if (active)
          setConfigResult({
            api: configApi,
            config: null,
            error: getErrorMessage(error),
          });
      });
    return () => {
      active = false;
    };
  }, [configApi]);

  const currentConfig = configResult?.api === configApi ? configResult : null;
  return {
    importanceOptions: currentConfig?.config?.importance.options ?? [],
    configError: currentConfig?.error ?? null,
  };
}
