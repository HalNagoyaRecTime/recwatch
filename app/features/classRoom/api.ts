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

export type ClassRoomWriteInput = {
  classCode: string;
  className: string;
  teacherId: number | null;
};

export type ClassRoomMutationApi = {
  createClassRoom(input: ClassRoomWriteInput): Promise<ClassRoomDTO>;
  updateClassRoom(
    classRoomId: number,
    input: ClassRoomWriteInput
  ): Promise<ClassRoomDTO>;
  deleteClassRoom(classRoomId: number): Promise<void>;
};

const CLASSROOM_LIST_LIMIT = 100;

export const ClassRoomApi = {
  getClassRooms: (offset = 0) =>
    apiClient.get<ClassRoomPageDTO>(
      `/api/v1/classrooms?limit=${CLASSROOM_LIST_LIMIT}&offset=${offset}`
    ),
  createClassRoom: (body: ClassRoomWriteInput) =>
    apiClient.post<ClassRoomDTO>("/api/v1/classrooms", body),
  updateClassRoom: (classRoomId: number, body: ClassRoomWriteInput) =>
    apiClient.put<ClassRoomDTO>(`/api/v1/classrooms/${classRoomId}`, body),
  deleteClassRoom: (classRoomId: number) =>
    apiClient.delete(`/api/v1/classrooms/${classRoomId}`),
};
