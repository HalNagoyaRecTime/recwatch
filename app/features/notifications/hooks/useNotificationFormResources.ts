import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { useNotificationAudienceOptions } from "~/features/notifications/hooks/useNotificationAudienceOptions";
import { useNotificationFormConfig } from "~/features/notifications/hooks/useNotificationFormConfig";
import { useNotificationRecipientCount } from "~/features/notifications/hooks/useNotificationRecipientCount";

/** 新規・編集で共通の取得処理を組み立てる。 */
export function useNotificationFormResources({
  audienceApi,
  configApi,
  audiences,
  countEnabled = true,
}: {
  audienceApi: NotificationAudienceApi;
  configApi: NotificationConfigApi;
  audiences: NotificationDraft["audiences"];
  countEnabled?: boolean;
}) {
  const audience = useNotificationAudienceOptions(audienceApi);
  const config = useNotificationFormConfig(configApi);
  const count = useNotificationRecipientCount(
    configApi,
    audiences,
    countEnabled
  );
  return { ...audience, ...config, ...count };
}
