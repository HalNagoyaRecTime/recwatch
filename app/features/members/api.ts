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

export type StudentImportRow = {
  class_code: string;
  attendance_number: number;
  student_id_number: string;
  last_name: string;
  first_name: string;
};

export type StudentImportErrorReason =
  | "student_id_number_duplicate_in_file"
  | "student_id_number_duplicate_in_db";

export type StudentImportRowError = {
  row_index: number;
  class_code: string;
  attendance_number: number;
  student_id_number: string;
  display_name: string;
  reason: StudentImportErrorReason;
};

export type StudentImportValidationResult = {
  total: number;
  success_count: number;
  error_count: number;
  errors: StudentImportRowError[];
};

export type StudentImportCommitResult = {
  total: number;
  imported: number;
  error_count: number;
  errors: StudentImportRowError[];
};

export const StudentImportApi = {
  validate: (rows: StudentImportRow[]) =>
    apiClient.post<StudentImportValidationResult>(
      "/api/v1/students/master-imports/validate",
      { rows }
    ),
  // 422 means some rows failed validation; the response body still carries
  // the same shape as a 201, so it's treated as data rather than an error.
  commit: async (rows: StudentImportRow[]) => {
    const { data } =
      await apiClient.postAllowingStatuses<StudentImportCommitResult>(
        "/api/v1/students/master-imports/commit",
        { rows },
        [422]
      );
    return data;
  },
};
