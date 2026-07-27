export type ScheduleOption = {
  id: string;
  name: string;
};

export type ScheduleFormOptions = {
  venues: ScheduleOption[];
  gatheringSpots: ScheduleOption[];
  events: ScheduleOption[];
};
