import { apiClient } from "~/lib/api-client";

import type {
  TeacherCreateRequest,
  TeacherListQuery,
  TeacherUpdateRequest,
} from "~/features/teachers/api/contracts/teacher-api";
import type {
  TeacherDTO,
  TeacherPageDTO,
} from "~/features/teachers/api/dto/teacher-dto";

const TEACHER_PAGE_SIZE = 50;

export const teacherHttpApi = {
  getTeachers: ({
    limit = TEACHER_PAGE_SIZE,
    offset = 0,
    search,
    sortBy,
    sortOrder,
  }: TeacherListQuery = {}) => {
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
