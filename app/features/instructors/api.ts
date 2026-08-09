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

export type TeacherUpdateRequest = {
  userName: string;
  isLiveActive: boolean;
  classRoomIds: number[];
};

export type ClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
  student_count: number;
  teacher: { teacher_id: number; display_name: string } | null;
};

export type ClassRoomPageDTO = {
  classrooms: ClassRoomDTO[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_LIMIT = 100;

export const TeacherApi = {
  async getTeachers(): Promise<TeacherPageDTO> {
    const items: TeacherDTO[] = [];
    let page = 1;
    let total = 0;

    while (true) {
      const result = await apiClient.get<TeacherPageDTO>(
        `/api/v1/teachers?limit=${PAGE_LIMIT}&page=${page}`
      );
      items.push(...result.items);
      total = result.total;

      if (result.items.length === 0 || page >= result.total_pages) break;
      page += 1;
    }

    return { items, total, page: 1, limit: items.length, total_pages: 1 };
  },
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
};

export const ClassRoomApi = {
  async getClassRooms(): Promise<ClassRoomPageDTO> {
    const classrooms: ClassRoomDTO[] = [];
    let offset = 0;
    let total = 0;

    while (true) {
      const result = await apiClient.get<ClassRoomPageDTO>(
        `/api/v1/classrooms?limit=${PAGE_LIMIT}&offset=${offset}`
      );
      classrooms.push(...result.classrooms);
      total = result.total;
      offset += result.classrooms.length;

      if (result.classrooms.length === 0 || offset >= total) break;
    }

    return { classrooms, total, limit: classrooms.length, offset: 0 };
  },
};
