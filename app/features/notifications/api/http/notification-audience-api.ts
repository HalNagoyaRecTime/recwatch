import { apiClient } from "~/lib/api-client";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import {
  toGatheringAudienceDtos,
  toNotificationAudienceOptions,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";
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
    },
  };
}

export const httpNotificationAudienceApi = createHttpNotificationAudienceApi();
