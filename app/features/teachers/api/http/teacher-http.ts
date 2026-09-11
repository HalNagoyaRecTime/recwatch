import { apiClient } from "~/lib/api-client";
import type {
  TeacherCreateRequest,
  TeacherListQuery,
  TeacherUpdateRequest,
} from "../contracts/teacher-api";
import type { TeacherDTO, TeacherListPageDTO } from "../dto/teacher-dto";

export const teacherHttpApi = {
  createTeacher: (body: TeacherCreateRequest) =>
    apiClient.post<TeacherDTO>("/api/v1/teachers", body),
  getTeacherList: (query: TeacherListQuery = {}) => {
    const params = new URLSearchParams({
      limit: String(query.limit ?? 50),
      offset: String(query.offset ?? 0),
    });
    if (query.search) params.set("search", query.search);
    if (query.classRoomId !== undefined)
      params.set("classRoomId", String(query.classRoomId));
    params.set("isStaff", query.isStaff ?? "all");
    params.set("isLiveActive", query.isLiveActive ?? "true");
    params.set("sortBy", query.sortBy ?? "teacherId");
    params.set("sortOrder", query.sortOrder ?? "asc");
    return apiClient.get<TeacherListPageDTO>(
      `/api/v1/teachers?${params.toString()}`
    );
  },
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
};
