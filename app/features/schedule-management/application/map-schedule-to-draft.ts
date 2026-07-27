import type { ScheduleDraft } from "~/features/schedule-editor/model/schedule-draft";
import type { ScheduleFormOptions } from "~/features/schedule-editor/model/schedule-option";

import type { ManagedSchedule } from "../model/schedule";

function findOptionId(
  options: ScheduleFormOptions[keyof ScheduleFormOptions],
  name: string | null
) {
  if (!name) {
    return "";
  }

  return options.find((option) => option.name === name)?.id ?? "";
}

export function mapScheduleToDraft(
  schedule: ManagedSchedule,
  options: ScheduleFormOptions
): ScheduleDraft {
  return {
    type: schedule.type,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    venueId: findOptionId(options.venues, schedule.venueName),
    gatheringSpotId: findOptionId(
      options.gatheringSpots,
      schedule.gatheringSpotName
    ),
    eventId: findOptionId(options.events, schedule.relatedEventName),
    notes: schedule.notes ?? "",
    notificationEnabled: schedule.notificationEnabled,
  };
}
