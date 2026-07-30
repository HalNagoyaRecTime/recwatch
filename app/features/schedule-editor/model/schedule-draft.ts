export type ScheduleDraft = {
  eventName: string;
  startTime: string;
  endTime: string;
  venue: string;
  notes: string;
  notificationEnabled: boolean;
};

export const initialScheduleDraft: ScheduleDraft = {
  eventName: "",
  startTime: "",
  endTime: "",
  venue: "",
  notes: "",
  notificationEnabled: true,
};
