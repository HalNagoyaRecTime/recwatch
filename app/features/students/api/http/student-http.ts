import { apiClient } from "~/lib/api-client";
import type { StudentListQuery } from "~/features/students/api/contracts/student-api";
import type {
  StudentDTO,
  StudentPageDTO,
  StudentWriteDTO,
} from "~/features/students/api/dto/student-dto";
import type { StudentWriteInput } from "~/features/students/model/student";

export type StudentHttpClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
};

export function createStudentHttpApi(client: StudentHttpClient = apiClient): {
  getStudents(query?: StudentListQuery): Promise<StudentPageDTO>;
  createStudent(input: StudentWriteInput): Promise<StudentDTO>;
  updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentDTO>;
} {
  return {
    getStudents(query = {}) {
      const params = new URLSearchParams({
        limit: String(query.limit ?? 50),
        offset: String(query.offset ?? 0),
      });
      const search = query.search?.trim();
      if (search) params.set("search", search);
      if (query.classRoomId !== undefined) {
        params.set("classRoomId", String(query.classRoomId));
      }
      params.set("isStaff", query.isStaff ?? "all");
      params.set("isLiveActive", query.isLiveActive ?? "all");
      params.set("sortBy", query.sortBy ?? "studentId");
      params.set("sortOrder", query.sortOrder ?? "asc");

      return client.get<StudentPageDTO>(
        `/api/v1/students?${params.toString()}`
      );
    },
    createStudent(input) {
      return client.post<StudentDTO>(
        "/api/v1/students",
        toStudentWriteDTO(input)
      );
    },
    updateStudent(studentId, input) {
      return client.put<StudentDTO>(
        `/api/v1/students/${studentId}`,
        toStudentWriteDTO(input)
      );
    },
  };
}

export const studentHttpApi = createStudentHttpApi();

function toStudentWriteDTO(input: StudentWriteInput): StudentWriteDTO {
  return {
    attendance_number: input.attendanceNumber,
    class_room_id: input.classRoomId,
    display_name: input.displayName,
    student_id_number: input.studentIdNumber,
  };
}
