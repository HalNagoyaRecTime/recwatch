import type {
  StudentPage,
  StudentRow,
  StudentWriteInput,
} from "~/features/members/model/student";

export type StudentListSortBy =
  | "studentId"
  | "studentIdNumber"
  | "displayName"
  | "classCode"
  | "className"
  | "attendanceNumber"
  | "isStaff"
  | "isLiveActive";
export type StudentListSortOrder = "asc" | "desc";
export type StudentBooleanFilter = "true" | "false" | "all";

export type StudentListQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  classRoomId?: number;
  isStaff?: StudentBooleanFilter;
  isLiveActive?: StudentBooleanFilter;
  sortBy?: StudentListSortBy;
  sortOrder?: StudentListSortOrder;
};

export interface StudentManagementApi {
  getStudents(query?: StudentListQuery): Promise<StudentPage>;
  createStudent(input: StudentWriteInput): Promise<StudentRow>;
  updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentRow>;
}
