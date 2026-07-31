import { apiClient } from "~/lib/api-client";

export type TeacherClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

export type TeacherDTO = {
  teacher_id: number;
  user_id: number;
  display_name: string;
  is_live_active: boolean;
  class_rooms: TeacherClassRoomDTO[];
};

export type TeacherPageDTO = {
  items: TeacherDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export const TeacherApi = {
  getTeachers: () =>
    apiClient.get<TeacherPageDTO>("/api/v1/teachers?limit=100"),
};
