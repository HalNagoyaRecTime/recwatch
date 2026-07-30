import { apiClient } from "~/lib/api-client";

export type ClassRoomTeacherDTO = {
  teacher_id: number;
  user_id: number;
  display_name: string;
};

export type ClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
  teacher: ClassRoomTeacherDTO | null;
};

export type ClassRoomPageDTO = {
  classrooms: ClassRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};

const CLASSROOM_LIST_LIMIT = 100;

export const ClassRoomApi = {
  getClassRooms: (offset = 0) =>
    apiClient.get<ClassRoomPageDTO>(
      `/api/v1/classrooms?limit=${CLASSROOM_LIST_LIMIT}&offset=${offset}`
    ),
};
