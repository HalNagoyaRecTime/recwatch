import { apiClient } from "~/lib/api-client";
import type {
  NotificationSubmission,
  NotificationSubmitter,
} from "~/features/notifications/application/notification-submitter";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";
import { toNotificationSubmissionError } from "~/features/notifications/infrastructure/admin-notification-error-mapper";
import { toCreateAdminNotificationRequest } from "~/features/notifications/infrastructure/admin-notification-request-mapper";
import { toNotificationSubmission } from "~/features/notifications/infrastructure/admin-notification-response-mapper";

type AdminNotificationClient = {
  post(path: string, body: unknown): Promise<unknown>;
};

export function createHttpNotificationSubmitter(
  client: AdminNotificationClient = apiClient,
  now: () => Date = () => new Date()
): NotificationSubmitter {
  return {
    async submit(draft: NotificationDraft): Promise<NotificationSubmission> {
      try {
        const response = await client.post(
          "/api/v1/admin/notifications",
          toCreateAdminNotificationRequest(draft, now())
        );

        return toNotificationSubmission(response);
      } catch (error) {
        throw toNotificationSubmissionError(error);
      }
    },
  };
}

export const httpNotificationSubmitter = createHttpNotificationSubmitter();
