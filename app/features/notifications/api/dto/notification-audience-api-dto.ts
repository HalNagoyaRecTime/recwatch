export type ClassRoomAudienceApiDto = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

export type ClassRoomAudiencePageApiDto = {
  classrooms: ClassRoomAudienceApiDto[];
  total: number;
  limit: number;
  offset: number;
};

export type GatheringAudienceApiDto = {
  gathering_id: number;
  event_name: string;
  gathering_spot_name: string;
  gathering_time: string;
};

export type EventAudienceApiDto = {
  event_id: number;
  event_name: string;
};

export type EventAudiencePageApiDto = {
  events: EventAudienceApiDto[];
  total: number;
  limit: number;
  offset: number;
};
