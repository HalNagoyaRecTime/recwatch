import { apiClient } from "~/lib/api-client";

export type classRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

export const ClassRoomApi = {
  getClassRooms: () => apiClient.get<classRoomDTO[]>("/api/v1/classes"),
};
