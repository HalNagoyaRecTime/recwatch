import { apiClient } from "~/lib/api-client";

export type StudentClassRoomDTO = {
  class_room_id: number;
  class_code: string;
  class_name: string;
};

export type StudentDTO = {
  student_id: number;
  user_id: number;
  display_name: string;
  student_id_number: string;
  attendance_number: number;
  is_live_active: boolean;
  is_staff: boolean;
  class_room: StudentClassRoomDTO | null;
};

export type StudentListSortBy =
  | "studentId"
  | "studentIdNumber"
  | "displayName"
  | "classCode"
  | "className"
  | "attendanceNumber";
export type StudentListSortOrder = "asc" | "desc";
export type StudentBooleanFilter = "true" | "false" | "all";

export type StudentListQuery = {
  limit: number;
  offset: number;
  search?: string;
  classRoomId?: number;
  isStaff?: StudentBooleanFilter;
  isLiveActive?: StudentBooleanFilter;
  sortBy?: StudentListSortBy;
  sortOrder?: StudentListSortOrder;
};

export type StudentWriteInput = {
  attendanceNumber: number;
  classRoomId: number;
  displayName: string;
  studentIdNumber: string;
};

export type StudentPageDTO = {
  items: StudentDTO[];
  total: number;
  limit: number;
  offset: number;
};

export type StudentManagementApi = {
  createStudent(input: StudentWriteInput): Promise<StudentDTO>;
  deleteStudent(studentId: number): Promise<void>;
  getStudents(query: StudentListQuery): Promise<StudentPageDTO>;
  updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentDTO>;
};

export const StudentApi: StudentManagementApi = {
  getStudents: (query) => {
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.search) params.set("search", query.search);
    if (query.classRoomId !== undefined) {
      params.set("classRoomId", String(query.classRoomId));
    }
    if (query.isStaff) params.set("isStaff", query.isStaff);
    if (query.isLiveActive) params.set("isLiveActive", query.isLiveActive);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    return apiClient.get<StudentPageDTO>(
      `/api/v1/students?${params.toString()}`
    );
  },
  createStudent: (input) =>
    apiClient.post<StudentDTO>("/api/v1/students", toStudentWriteDto(input)),
  deleteStudent: (studentId) =>
    apiClient.delete(`/api/v1/students/${studentId}`),
  updateStudent: (studentId, input) =>
    apiClient.put<StudentDTO>(
      `/api/v1/students/${studentId}`,
      toStudentWriteDto(input)
    ),
};

function toStudentWriteDto(input: StudentWriteInput) {
  return {
    attendance_number: input.attendanceNumber,
    class_room_id: input.classRoomId,
    display_name: input.displayName,
    student_id_number: input.studentIdNumber,
  };
}
