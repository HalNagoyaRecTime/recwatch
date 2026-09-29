import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import {
  parseNotificationAudienceCount,
  parseNotificationConfig,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import { validateNotificationAudienceInput } from "~/features/notifications/api/mappers/notification-request-validator";
import { apiClient } from "~/lib/api-client";

export type NotificationConfigHttpClient = {
  get(path: string): Promise<unknown>;
  post(path: string, body: unknown): Promise<unknown>;
};

export function createHttpNotificationConfigApi(
  client: NotificationConfigHttpClient = apiClient
): NotificationConfigApi {
  return {
    async getConfig() {
      return parseNotificationConfig(
        await client.get("/api/v1/admin/notifications/config")
      );
    },

    async getAudienceCount(request) {
      const response = await client.post(
        "/api/v1/admin/notifications/audience-count",
        { audience: validateNotificationAudienceInput(request.audience) }
      );
      return parseNotificationAudienceCount(response);
    },
  };
}

export const httpNotificationConfigApi = createHttpNotificationConfigApi();
