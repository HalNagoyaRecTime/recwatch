import type { ScheduleDraft } from "~/features/schedule-editor/model/schedule-draft";

import type { ManagedSchedule } from "../model/schedule";

export function mapScheduleToDraft(schedule: ManagedSchedule): ScheduleDraft {
  return {
    eventName: schedule.relatedEventName ?? "",
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    venue: schedule.venueName ?? "",
    notes: schedule.notes ?? "",
    notificationEnabled: schedule.notificationEnabled,
  };
}
