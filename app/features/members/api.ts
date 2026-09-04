import { apiClient } from "~/lib/api-client";

export type StudentDTO = {
  student_id: number;
  user_id?: number;
  display_name: string;
  class_room_id: number;
  class_room_name: string;
  attendance_number: number;
  student_id_number: string;
  is_live_active: boolean;
};

export type StudentWriteInput = {
  attendanceNumber: number;
  classRoomId: number;
  displayName: string;
  studentIdNumber: string;
};

export type StudentManagementApi = {
  createStudent(input: StudentWriteInput): Promise<StudentDTO>;
  deleteStudent(studentId: number): Promise<void>;
  getAllStudents(): Promise<StudentDTO[]>;
  updateStudent(
    studentId: number,
    input: StudentWriteInput
  ): Promise<StudentDTO>;
};

export type StudentPageDTO = {
  students: StudentDTO[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_LIMIT = 100;

export const StudentApi = {
  async getAllStudents(): Promise<StudentDTO[]> {
    const students: StudentDTO[] = [];
    let offset = 0;

    while (true) {
      const page = await apiClient.get<StudentPageDTO>(
        `/api/v1/students?limit=${PAGE_LIMIT}&offset=${offset}`
      );
      students.push(...page.students);
      offset += page.students.length;

      if (page.students.length === 0 || offset >= page.total) break;
    }

    return students;
  },
  createStudent: (input: StudentWriteInput) =>
    apiClient.post<StudentDTO>("/api/v1/students", toStudentWriteDto(input)),
  deleteStudent: (studentId: number) =>
    apiClient.delete(`/api/v1/students/${studentId}`),
  updateStudent: (studentId: number, input: StudentWriteInput) =>
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
