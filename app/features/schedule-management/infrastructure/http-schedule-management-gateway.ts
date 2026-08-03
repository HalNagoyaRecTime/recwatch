import type { EventNotificationGateway } from "~/features/event-notification/application/event-notification-gateway";
import { EventNotificationError } from "~/features/event-notification/application/event-notification-error";
import { toEventNotificationError } from "~/features/event-notification/infrastructure/event-notification-error-mapper";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import type { EventApiDto, EventPageApiDto } from "./event-management-api-dto";
import { toManagedSchedule } from "./event-management-response-mapper";

export type EventManagementHttpClient = {
  get<T>(path: string): Promise<T>;
};

export function createHttpScheduleManagementGateway(
  client: EventManagementHttpClient,
  eventNotificationGateway: EventNotificationGateway
): ScheduleManagementGateway {
  return {
    async list() {
      try {
        const events = await listAllEvents(client);

        return await Promise.all(
          events.map(async (event) =>
            toManagedSchedule(
              event,
              await eventNotificationGateway.getNotificationSummary(
                event.event_id
              )
            )
          )
        );
      } catch (error) {
        throw toEventNotificationError(error);
      }
    },

    async get(scheduleId) {
      try {
        const eventId = parseEventId(scheduleId);
        const [event, summary] = await Promise.all([
          client.get<EventApiDto>(`/api/v1/events/${eventId}`),
          eventNotificationGateway.getNotificationSummary(eventId),
        ]);

        return toManagedSchedule(event, summary);
      } catch (error) {
        throw toEventNotificationError(error);
      }
    },

    async cancelNotification(scheduleId) {
      try {
        const eventId = parseEventId(scheduleId);
        const result = await eventNotificationGateway.patchEvent({
          eventId,
          notificationEnabled: false,
        });
        const summary =
          await eventNotificationGateway.getNotificationSummary(eventId);

        return toManagedSchedule(
          {
            event_id: result.event.id,
            event_name: result.event.name,
            rule_text: result.event.ruleText,
            venue: result.event.venue,
            start_time: result.event.startTime.replace(":", ""),
            end_time: result.event.endTime.replace(":", ""),
          },
          summary
        );
      } catch (error) {
        throw toEventNotificationError(error);
      }
    },
  };
}

async function listAllEvents(client: EventManagementHttpClient) {
  const limit = 100;
  const events: EventApiDto[] = [];

  while (true) {
    const page = await client.get<EventPageApiDto>(
      `/api/v1/events?limit=${limit}&offset=${events.length}`
    );
    events.push(...page.events);

    if (events.length >= page.total || page.events.length === 0) {
      return events;
    }
  }
}

function parseEventId(value: string) {
  const eventId = Number(value);
  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    throw new EventNotificationError("invalid_request");
  }
  return eventId;
}
