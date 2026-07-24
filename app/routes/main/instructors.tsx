import { useLoaderData } from "react-router";
import { TeacherApi } from "~/features/instructors/api";
import { toTeacherRow } from "~/features/instructors/model/teacher";
import { InstructorsPage } from "~/features/instructors/pages/InstructorsPage";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

export async function clientLoader() {
  const page = await TeacherApi.getTeachers();
  return { teachers: page.items.map(toTeacherRow) };
}

export default function InstructorsRoute() {
  const { teachers } = useLoaderData<typeof clientLoader>();
  return <InstructorsPage teachers={teachers} />;
}
