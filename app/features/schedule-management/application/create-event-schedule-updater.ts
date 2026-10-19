import type { EventNotificationGateway } from "~/features/event-notification/application/event-notification-gateway";
import type { EventPatch } from "~/features/event-notification/model/event-notification";
import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";

import type { ManagedSchedule } from "../model/schedule";

export function createEventScheduleUpdater(
  initial: ManagedSchedule,
  gateway: EventNotificationGateway
): ScheduleSubmitter {
  return {
    async submit(draft) {
      const eventId = Number(initial.id);
      const patch: EventPatch = {
        eventId,
        ...(draft.eventName.trim() !== initial.relatedEventName
          ? { name: draft.eventName }
          : {}),
        ...(draft.venue.trim() !== initial.venueName
          ? { venue: draft.venue }
          : {}),
        ...(draft.startTime !== initial.startTime
          ? { startTime: draft.startTime }
          : {}),
        ...(draft.endTime !== initial.endTime
          ? { endTime: draft.endTime }
          : {}),
        ...(draft.notes.trim() !== (initial.notes ?? "")
          ? { ruleText: draft.notes }
          : {}),
        ...(draft.notificationEnabled !== initial.notificationEnabled
          ? { notificationEnabled: draft.notificationEnabled }
          : {}),
      };

      if (Object.keys(patch).length > 1) {
        await gateway.patchEvent(patch);
      }

      return { scheduleId: initial.id };
    },
  };
}
