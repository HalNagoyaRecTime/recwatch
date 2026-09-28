import { TeacherApi, type TeacherListQuery } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";

export async function loadActiveTeacherOptions() {
  const page = await TeacherApi.getActiveTeachers();
  return page.items.map((teacher) => {
    const row = toTeacherRow(teacher);
    return { displayName: row.displayName, teacherId: row.teacherId };
  });
}

export async function loadTeacherListPage(query: TeacherListQuery) {
  const page = await TeacherApi.getTeacherList(query);
  return {
    limit: page.limit,
    offset: page.offset,
    teachers: page.items.map(toTeacherRow),
    total: page.total,
  };
}

export function parseTeacherId(value: string | undefined) {
  const teacherId = Number(value);
  return Number.isInteger(teacherId) && teacherId > 0 ? teacherId : 0;
}
