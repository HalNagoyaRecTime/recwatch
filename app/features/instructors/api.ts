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

const PAGE_LIMIT = 100;

export const TeacherApi = {
  async getAllTeachers(): Promise<TeacherDTO[]> {
    const teachers: TeacherDTO[] = [];
    let page = 1;

    while (true) {
      const result = await apiClient.get<TeacherPageDTO>(
        `/api/v1/teachers?limit=${PAGE_LIMIT}&page=${page}`
      );
      teachers.push(...result.items);

      if (result.items.length === 0 || page >= result.total_pages) break;
      page += 1;
    }

    return teachers;
  },
};
