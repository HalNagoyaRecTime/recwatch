import { apiClient } from "~/lib/api-client";
import type {
  NotificationSubmission,
  NotificationSubmitter,
} from "../application/notification-submitter";
import type { NotificationDraft } from "../model/notification-draft";
import { toNotificationSubmissionError } from "./admin-notification-error-mapper";
import { toCreateAdminNotificationRequest } from "./admin-notification-request-mapper";
import { toNotificationSubmission } from "./admin-notification-response-mapper";

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
