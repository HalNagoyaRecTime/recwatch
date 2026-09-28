import {
  TeacherApi,
  type TeacherListQuery,
  type TeacherQueryApi,
} from "~/features/teachers/api";

export async function loadTeacherListPage(
  query: TeacherListQuery,
  api: Pick<TeacherQueryApi, "getTeacherList"> = TeacherApi
) {
  const page = await api.getTeacherList(query);
  return {
    limit: page.limit,
    offset: page.offset,
    teachers: page.items,
    total: page.total,
  };
}

export function parseTeacherId(value: string | undefined): number {
  const teacherId = Number(value);
  if (!Number.isInteger(teacherId) || teacherId <= 0) {
    throw new Response("教官が見つかりません。", { status: 404 });
  }
  return teacherId;
}
