import type {
  StudentPage,
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

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
  getStudentById(studentId: number): Promise<StudentRow>;
  createStudent(input: StudentWriteInput): Promise<StudentRow>;
  updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentRow>;
}

export type StudentMutationApi = Pick<
  StudentManagementApi,
  "createStudent" | "updateStudent"
>;

export interface StudentAccessMutationApi {
  updateUserStatus(userId: number, isLiveActive: boolean): Promise<void>;
  grantStaff(userId: number): Promise<void>;
  revokeStaff(userId: number): Promise<void>;
}
