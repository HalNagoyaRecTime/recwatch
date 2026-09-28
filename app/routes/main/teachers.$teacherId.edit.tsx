import { useLoaderData, useRouteLoaderData } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { TeacherApi } from "~/features/teachers/api";
import { parseTeacherId } from "~/features/teachers/application/teacher-loaders";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import type { clientLoader as parentClientLoader } from "./teachers";

export function meta() {
  return [{ title: createPageTitle("教官情報の編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { teacherId?: string };
}) {
  const teacherId = parseTeacherId(params.teacherId);
  return { teacher: await TeacherApi.getTeacherById(teacherId) };
}

export default function TeacherEditRoute() {
  const { teacher } = useLoaderData<typeof clientLoader>();
  const { classRooms } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.teachers
  )!;
  const closeModal = useManagementModalReturn();
  return (
    <TeacherEditPage
      api={TeacherApi}
      classRooms={classRooms}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacher={teacher}
    />
  );
}
