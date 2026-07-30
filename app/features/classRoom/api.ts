import { apiClient } from "~/lib/api-client";

export type classRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
};

export type classRoomPageDTO = {
  classrooms: classRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};

export const ClassRoomApi = {
  getClassRooms: () =>
    apiClient.get<classRoomPageDTO>("/api/v1/classrooms?limit=100&offset=0"),
};
