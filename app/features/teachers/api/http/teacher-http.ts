import { apiClient } from "~/lib/api-client";
import type {
  TeacherAssignmentUpdateRequest,
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
    if (query.classRoomId !== undefined)
      params.set("classRoomId", String(query.classRoomId));
    if (query.isStaff) params.set("isStaff", query.isStaff);
    if (query.isLiveActive) params.set("isLiveActive", query.isLiveActive);
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
  deleteTeacher: (teacherId: number) =>
    apiClient.delete(`/api/v1/teachers/${teacherId}`),
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
  updateTeacherAssignment: (
    teacherId: number,
    body: TeacherAssignmentUpdateRequest
  ) => apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
};

export const classRoomHttpApi = {
  getClassRoomsPage: (offset: number) =>
    apiClient.get<ClassRoomPageDTO>(
      `/api/v1/classrooms?limit=100&offset=${offset}`
    ),
};
