import { ClientError, ClientErrors } from "~/lib/client-error";
import type {
  ClassRoomAudienceApiDto,
  UserAudienceApiDto,
  EventAudienceApiDto,
} from "~/features/notifications/api/dto/notification-audience-api-dto";
import {
  toClassRoomAudiencePage,
  toUserAudiencePage,
  toEventAudiencePage,
} from "~/features/notifications/api/mappers/notification-audience-response-mapper";

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export type NotificationAudienceHttpClient = {
  get(path: string): Promise<unknown>;
};

export async function loadAllClassrooms(
  client: NotificationAudienceHttpClient
) {
  const classrooms: ClassRoomAudienceApiDto[] = [];

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const page = toClassRoomAudiencePage(
      await client.get(
        `/api/v1/classrooms?limit=${PAGE_SIZE}&offset=${classrooms.length}`
      )
    );
    classrooms.push(...page.items);

    if (classrooms.length >= page.total || page.items.length === 0) {
      return classrooms;
    }
  }

  throw new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
}

export async function loadAllEvents(client: NotificationAudienceHttpClient) {
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

  throw new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
}

export async function loadAllUsers(client: NotificationAudienceHttpClient) {
  const pages = await Promise.all(
    ["students", "teachers"].map(async (resource) => {
      const users: UserAudienceApiDto[] = [];
      for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
        const page = toUserAudiencePage(
          await client.get(
            `/api/v1/${resource}?limit=${PAGE_SIZE}&offset=${users.length}&isStaff=all&isLiveActive=true`
          )
        );
        users.push(...page.items);
        if (users.length >= page.total || page.items.length === 0) return users;
      }
      throw new ClientError(ClientErrors.RESPONSE_PARSE_ERROR);
    })
  );
  return [
    ...new Map(pages.flat().map((user) => [user.user_id, user])).values(),
  ];
}
