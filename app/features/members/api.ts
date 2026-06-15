import { apiClient } from "~/lib/api-client";

// APIのレスポンス型
export type StudentDTO = {
  student_id: number;
  display_name: string;
  class_room_id: number;
  uid: string;
  attendance_number: number;
  student_id_number: string;
};

export const membersApi = {
  getStudents: () => apiClient.get<StudentDTO[]>("/api/v1/students"),
};
