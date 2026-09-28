import type {
  StudentListQuery,
  StudentManagementApi,
} from "~/features/students/api/contracts/student-api";
import { parseStudentListUrl } from "~/features/students/application/student-list-url";
import type { StudentRow } from "~/features/students/model/student";

export type StudentManagementPageData = {
  limit: number;
  offset: number;
  students: StudentRow[];
  total: number;
};

const STUDENT_LIST_LIMIT = 50;

export async function loadStudentManagementPage(
  input: string | URLSearchParams,
  api: Pick<StudentManagementApi, "getStudents">
): Promise<StudentManagementPageData> {
  const {
    page,
    search,
    classRoomId,
    sortBy,
    sortOrder,
    isStaff,
    isLiveActive,
  } = parseStudentListUrl(input);
  const offset = (page - 1) * STUDENT_LIST_LIMIT;
  const query: StudentListQuery = {
    limit: STUDENT_LIST_LIMIT,
    offset,
    search: search || undefined,
    classRoomId: classRoomId ?? undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
    isStaff,
    isLiveActive,
  };
  const studentsPage = await api.getStudents(query);

  return {
    limit: STUDENT_LIST_LIMIT,
    offset,
    students: studentsPage.items,
    total: studentsPage.total,
  };
}

export function parseStudentId(value: string | undefined): number {
  const studentId = Number(value);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Response("学生が見つかりません。", { status: 404 });
  }
  return studentId;
}
