import type {
  StudentBooleanFilter,
  StudentListQuery,
  StudentListSortBy,
  StudentListSortOrder,
  StudentMutationApi,
  StudentAccessMutationApi,
  StudentManagementApi,
} from "./contracts/student-api";
import type {
  StudentClassRoomDTO,
  StudentDTO,
  StudentManagementDTO,
  StudentPageDTO,
} from "./dto/student-dto";
import { studentHttpApi } from "./http/student-http";
import { toStudentPage, toStudentRow } from "./mappers/student-mappers";
import type {
  StudentPage,
  StudentRow,
  StudentWriteInput,
} from "~/features/students/model/student";

export const StudentApi: StudentManagementApi = {
  async getStudents(query = {}): Promise<StudentPage> {
    return toStudentPage(await studentHttpApi.getStudents(query));
  },
  async getStudentById(studentId: number): Promise<StudentRow> {
    return toStudentRow(await studentHttpApi.getStudentById(studentId));
  },
  async createStudent(input: StudentWriteInput): Promise<StudentRow> {
    return toStudentRow(await studentHttpApi.createStudent(input));
  },
  async updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentRow> {
    return toStudentRow(await studentHttpApi.updateStudent(studentId, input));
  },
};

export type {
  StudentBooleanFilter,
  StudentListQuery,
  StudentListSortBy,
  StudentListSortOrder,
  StudentManagementApi,
  StudentMutationApi,
  StudentAccessMutationApi,
};
export type {
  StudentClassRoomDTO,
  StudentDTO,
  StudentManagementDTO,
  StudentPageDTO,
};
export type { StudentPage, StudentRow, StudentWriteInput };
