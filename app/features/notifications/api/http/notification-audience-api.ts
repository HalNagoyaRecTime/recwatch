import { ApiClientError } from "~/lib/api-client-error";
import { apiClient } from "~/lib/api-client";
import type { NotificationAudienceApi } from "~/features/notifications/api/contracts/notification-audience-api";
import { NotificationAudienceLoadingError } from "~/features/notifications/model/notification-audience-loading-error";
import type {
  ClassRoomAudienceApiDto,
  EventAudienceApiDto,
} from "~/features/notifications/api/dto/notification-audience-api-dto";
import {
  toClassRoomAudiencePage,
  toEventAudiencePage,
  toGatheringAudienceDtos,
  toNotificationAudienceOptions,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

type NotificationAudienceHttpClient = {
  get(path: string): Promise<unknown>;
};

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
        if (error instanceof NotificationAudienceLoadingError) {
          throw error;
        }
        if (error instanceof ApiClientError) {
          if (error.status === 401) {
            throw new NotificationAudienceLoadingError(
              "authentication_required",
              { cause: error }
            );
          }
          if (error.status === 403) {
            throw new NotificationAudienceLoadingError("forbidden", {
              cause: error,
            });
          }
        }
        throw new NotificationAudienceLoadingError("unexpected", {
          cause: error,
        });
      }
    },
  };
}

async function loadAllClassrooms(client: NotificationAudienceHttpClient) {
  const classrooms: ClassRoomAudienceApiDto[] = [];

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const page = toClassRoomAudiencePage(
      await client.get(
        `/api/v1/classrooms?limit=${PAGE_SIZE}&offset=${classrooms.length}`
      )
    );
    classrooms.push(...page.classrooms);

    if (classrooms.length >= page.total || page.classrooms.length === 0) {
      return classrooms;
    }
  }

  throw new NotificationAudienceLoadingError("unexpected");
}

async function loadAllEvents(client: NotificationAudienceHttpClient) {
  const events: EventAudienceApiDto[] = [];

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const page = toEventAudiencePage(
      await client.get(
        `/api/v1/events?limit=${PAGE_SIZE}&offset=${events.length}`
      )
    );
    events.push(...page.events);

    if (events.length >= page.total || page.events.length === 0) {
      return events;
    }
  }

  throw new NotificationAudienceLoadingError("unexpected");
}

export const httpNotificationAudienceApi = createHttpNotificationAudienceApi();
