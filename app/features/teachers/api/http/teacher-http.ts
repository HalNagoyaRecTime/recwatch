import { apiClient } from "~/lib/api-client";
import type { TeacherUpdateRequest } from "../contracts/teacher-api";
import type {
  ClassRoomPageDTO,
  TeacherDTO,
  TeacherPageDTO,
} from "../dto/teacher-dto";

export const teacherHttpApi = {
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
