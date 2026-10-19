import { apiClient } from "~/lib/api-client";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import {
  toGatheringAudienceDtos,
  toNotificationAudienceOptions,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";
import { toNotificationAudienceLoadingError } from "~/features/notifications/api/mappers/notification-audience-error-mapper";
import {
  loadAllClassrooms,
  loadAllEvents,
  type NotificationAudienceHttpClient,
} from "./notification-audience-resource-loader";

export function createHttpNotificationAudienceApi(
  client: NotificationAudienceHttpClient = apiClient
): NotificationAudienceApi {
  return {
    async load() {
      try {
        const [classrooms, gatheringsResponse, events] = await Promise.all([
          loadAllClassrooms(client),
          client.get("/api/v1/gatherings"),
          loadAllEvents(client),
        ]);

        return toNotificationAudienceOptions({
          classrooms,
          gatherings: toGatheringAudienceDtos(gatheringsResponse),
          events,
        });
      } catch (error) {
        throw toNotificationAudienceLoadingError(error);
      }
    },
  };
}

export const httpNotificationAudienceApi = createHttpNotificationAudienceApi();
