import type { ScheduleSubmitter } from "~/features/schedule-editor/application/schedule-submitter";

import { mockScheduleManagementStore } from "./mock-schedule-management-store";

export function createMockScheduleUpdater(
  scheduleId: string
): ScheduleSubmitter {
  return {
    async submit(draft) {
      const current = await mockScheduleManagementStore.get(scheduleId);

      await mockScheduleManagementStore.update({
        ...current,
        startTime: draft.startTime,
        endTime: draft.endTime,
        venueName: draft.venue.trim(),
        relatedEventName: draft.eventName.trim(),
        notes: draft.notes.trim() || null,
        notificationEnabled: draft.notificationEnabled,
      });

      return { scheduleId };
    },
  };
}
