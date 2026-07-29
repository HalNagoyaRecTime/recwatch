export type SchedulePublication =
  | { mode: "none" }
  | { mode: "immediate" }
  | { mode: "scheduled"; publishAt: string };

export type ManagedSchedule = {
  id: string;
  startTime: string;
  endTime: string;
  venueName: string | null;
  gatheringSpotName: string | null;
  relatedEventName: string | null;
  notes: string | null;
  publication: SchedulePublication;
  notificationEnabled: boolean;
};
