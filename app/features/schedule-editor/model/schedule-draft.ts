export type ScheduleType =
  | "opening"
  | "competition"
  | "gathering"
  | "lunch"
  | "closing";

export type ScheduleDraft = {
  type: ScheduleType | null;
  startTime: string;
  endTime: string;
  venueId: string;
  gatheringSpotId: string;
  eventId: string;
  notes: string;
  notificationEnabled: boolean;
};

export const initialScheduleDraft: ScheduleDraft = {
  type: null,
  startTime: "",
  endTime: "",
  venueId: "",
  gatheringSpotId: "",
  eventId: "",
  notes: "",
  notificationEnabled: true,
};

export const scheduleTypeLabels: Record<ScheduleType, string> = {
  opening: "開会式",
  competition: "競技",
  gathering: "集合",
  lunch: "昼休み",
  closing: "閉会式",
};
