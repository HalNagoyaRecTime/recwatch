import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";
import type { ScheduleFormOptions } from "~/features/schedule-editor/model/schedule-option";

import { mockScheduleManagementStore } from "./mock-schedule-management-store";

function findOptionName(
  options: ScheduleFormOptions[keyof ScheduleFormOptions],
  id: string
) {
  return options.find((option) => option.id === id)?.name ?? null;
}

export function createMockScheduleUpdater(
  scheduleId: string,
  options: ScheduleFormOptions
): ScheduleSubmitter {
  return {
    async submit(draft) {
      const current = await mockScheduleManagementStore.get(scheduleId);

      await mockScheduleManagementStore.update({
        ...current,
        type: draft.type ?? current.type,
        startTime: draft.startTime,
        endTime: draft.endTime,
        venueName: findOptionName(options.venues, draft.venueId),
        gatheringSpotName: findOptionName(
          options.gatheringSpots,
          draft.gatheringSpotId
        ),
        relatedEventName: findOptionName(options.events, draft.eventId),
        notes: draft.notes.trim() || null,
        notificationEnabled: draft.notificationEnabled,
      });

      return { scheduleId };
    },
  };
}
