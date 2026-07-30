import { apiClient } from "~/lib/api-client";

export type StudentDTO = {
  student_id: number;
  display_name: string;
  class_room_id: number;
  class_room_name: string;
  attendance_number: number;
  student_id_number: string;
  is_live_active: boolean;
};

export type StudentPageDTO = {
  students: StudentDTO[];
  total: number;
  limit: number;
  offset: number;
};

export const StudentApi = {
  getStudents: () =>
    apiClient.get<StudentPageDTO>("/api/v1/students?limit=100&offset=0"),
};
