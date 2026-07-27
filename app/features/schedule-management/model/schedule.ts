export type ManagedScheduleType =
  | "opening"
  | "competition"
  | "gathering"
  | "lunch"
  | "closing";

export type SchedulePublication =
  | { mode: "immediate" }
  | { mode: "scheduled"; publishAt: string };

export type ManagedSchedule = {
  id: string;
  type: ManagedScheduleType;
  startTime: string;
  endTime: string;
  venueName: string | null;
  gatheringSpotName: string | null;
  relatedEventName: string | null;
  notes: string | null;
  publication: SchedulePublication;
  notificationEnabled: boolean;
};

export const managedScheduleTypeLabels: Record<ManagedScheduleType, string> = {
  opening: "開会式",
  competition: "競技",
  gathering: "集合",
  lunch: "昼休み",
  closing: "閉会式",
};
