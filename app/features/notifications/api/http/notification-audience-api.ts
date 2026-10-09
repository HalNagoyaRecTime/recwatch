import { apiClient } from "~/lib/api-client";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import {
  toEventGatheringAudienceDtos,
  toNotificationAudienceOptions,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";
import {
  loadAllClassrooms,
  loadAllEvents,
  loadAllUsers,
  type NotificationAudienceHttpClient,
} from "./notification-audience-resource-loader";

export function createHttpNotificationAudienceApi(
  client: NotificationAudienceHttpClient = apiClient
): NotificationAudienceApi {
  return {
    async load() {
      const [classrooms, events, users] = await Promise.all([
        loadAllClassrooms(client),
        loadAllEvents(client),
        loadAllUsers(client),
      ]);

      const gatheringsByEvent = await Promise.all(
        events.map(async (event) =>
          toEventGatheringAudienceDtos(
            await client.get(`/api/v1/events/${event.event_id}`),
            event
          )
        )
      );

      return toNotificationAudienceOptions({
        classrooms,
        users,
        gatherings: gatheringsByEvent.flat(),
        events,
      });
    },
  };
}

export const httpNotificationAudienceApi = createHttpNotificationAudienceApi();
