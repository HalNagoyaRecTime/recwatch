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
  limit: number;
  offset: number;
};

export type TeacherApiSortBy = "teacherId" | "displayName";
export type TeacherApiSortOrder = "asc" | "desc";

export type TeacherUpdateRequest = {
  userName: string;
  classRoomIds: number[];
};

export type TeacherCreateRequest = {
  userName: string;
  classRoomIds: number[];
};

const TEACHER_PAGE_SIZE = 50;

export const TeacherApi = {
  getTeachers: ({
    limit = TEACHER_PAGE_SIZE,
    offset = 0,
    search,
    sortBy,
    sortOrder,
  }: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: TeacherApiSortBy;
    sortOrder?: TeacherApiSortOrder;
  } = {}) => {
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (search?.trim()) query.set("search", search.trim());
    if (sortBy) query.set("sortBy", sortBy);
    if (sortOrder) query.set("sortOrder", sortOrder);

    return apiClient.get<TeacherPageDTO>(
      `/api/v1/teachers?${query.toString()}`
    );
  },
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
  createTeacher: (body: TeacherCreateRequest) =>
    apiClient.post<TeacherDTO>("/api/v1/teachers", body),
};
