import {
  TeacherApi,
  type TeacherListQuery,
  type TeacherQueryApi,
} from "~/features/teachers/api";
import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";

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
  const teacherId = parsePositiveIntegerRouteParam(value);
  if (teacherId === null) {
    throw new Response("教官が見つかりません。", { status: 404 });
  }
  return teacherId;
}
