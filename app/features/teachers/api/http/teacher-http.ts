import { apiClient } from "~/lib/api-client";
import type {
  TeacherCreateRequest,
  TeacherListQuery,
  TeacherUpdateRequest,
} from "../contracts/teacher-api";
import type {
  ClassRoomPageDTO,
  TeacherDTO,
  TeacherListPageDTO,
  TeacherPageDTO,
} from "../dto/teacher-dto";

export const teacherHttpApi = {
  createTeacher: (body: TeacherCreateRequest) =>
    apiClient.post<TeacherDTO>("/api/v1/teachers", body),
  getTeacherList: (query: TeacherListQuery) => {
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.search) params.set("search", query.search);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);
    return apiClient.get<TeacherListPageDTO>(
      `/api/v1/teachers?${params.toString()}`
    );
  },
  getTeachersPage: (offset: number) =>
    apiClient.get<TeacherPageDTO>(
      `/api/v1/teachers?limit=100&offset=${offset}`
    ),
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
};

export const classRoomHttpApi = {
  getClassRoomsPage: (offset: number) =>
    apiClient.get<ClassRoomPageDTO>(
      `/api/v1/classrooms?limit=100&offset=${offset}`
    ),
};
