import { managedScheduleTypeLabels, type ManagedSchedule } from "./schedule";

export function filterSchedules(schedules: ManagedSchedule[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");

  if (!normalizedQuery) {
    return schedules;
  }

  return schedules.filter((schedule) => {
    const searchableText = [
      managedScheduleTypeLabels[schedule.type],
      schedule.startTime,
      schedule.endTime,
      schedule.venueName,
      schedule.gatheringSpotName,
      schedule.relatedEventName,
      schedule.notes,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLocaleLowerCase("ja-JP");

    return searchableText.includes(normalizedQuery);
  });
}
