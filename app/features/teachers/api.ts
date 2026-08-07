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

export type TeacherUpdateRequest = {
  userName: string;
  isLiveActive: boolean;
  classRoomIds: number[];
};

export type TeacherCreateRequest = TeacherUpdateRequest;

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

const ALL_TEACHERS_LIMIT = 100;
const ALL_CLASSROOMS_LIMIT = 100;

export const TeacherApi = {
  getTeachers: () =>
    apiClient.get<TeacherPageDTO>(
      `/api/v1/teachers?limit=${ALL_TEACHERS_LIMIT}`
    ),
  getTeacherById: (teacherId: number) =>
    apiClient.get<TeacherDTO>(`/api/v1/teachers/${teacherId}`),
  updateTeacher: (teacherId: number, body: TeacherUpdateRequest) =>
    apiClient.put<TeacherDTO>(`/api/v1/teachers/${teacherId}`, body),
  createTeacher: (body: TeacherCreateRequest) =>
    apiClient.post<TeacherDTO>("/api/v1/teachers", body),
};

export const ClassRoomApi = {
  getClassRooms: () =>
    apiClient.get<ClassRoomPageDTO>(
      `/api/v1/classrooms?limit=${ALL_CLASSROOMS_LIMIT}`
    ),
};
