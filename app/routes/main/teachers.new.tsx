import { useRouteLoaderData } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { TeacherApi } from "~/features/teachers/api";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import type { clientLoader as parentClientLoader } from "./teachers";

export function meta() {
  return [{ title: createPageTitle("教官の新規登録") }];
}

export default function TeacherCreateRoute() {
  const { classRooms } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.teachers
  )!;
  const closeModal = useManagementModalReturn();
  return (
    <TeacherCreatePage
      api={TeacherApi}
      classRooms={classRooms}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
    />
  );
}
