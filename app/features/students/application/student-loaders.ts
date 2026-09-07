import { StudentApi, type StudentListQuery } from "~/features/students/api";

export async function loadStudentListPage(query: StudentListQuery) {
  const page = await StudentApi.getStudents(query);
  return {
    limit: page.limit,
    offset: page.offset,
    students: page.items,
    total: page.total,
  };
}
