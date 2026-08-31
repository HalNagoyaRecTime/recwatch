import { apiClient } from "~/lib/api-client";
import type {
  NotificationSubmission,
  NotificationSubmissionApi,
} from "~/features/notifications/api/contracts/notification-submission-api";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { toCreateAdminNotificationRequest } from "~/features/notifications/api/mappers/admin-notification-request-mapper";
import { toNotificationSubmission } from "~/features/notifications/api/mappers/admin-notification-response-mapper";

type AdminNotificationClient = {
  post(path: string, body: unknown): Promise<unknown>;
};

export function createHttpNotificationSubmissionApi(
  client: AdminNotificationClient = apiClient,
  now: () => Date = () => new Date()
): NotificationSubmissionApi {
  return {
    async submit(draft: NotificationDraft): Promise<NotificationSubmission> {
      const response = await client.post(
        "/api/v1/admin/notifications",
        toCreateAdminNotificationRequest(draft, now())
      );

      return toNotificationSubmission(response);
    },
  };
}

export const httpNotificationSubmissionApi =
  createHttpNotificationSubmissionApi();
