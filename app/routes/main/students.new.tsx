import { useRouteLoaderData } from "react-router";

import { StudentApi } from "~/features/students/api";
import { StudentCreatePage } from "~/features/students/pages/StudentCreatePage";
import { userManagementApi } from "~/features/user-management/api";
import { createPageTitle } from "~/lib/page-title";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import type { clientLoader as parentClientLoader } from "./students";

export function meta() {
  return [{ title: createPageTitle("学生の新規登録") }];
}

export default function StudentCreateRoute() {
  const { classRooms } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.students
  )!;
  const closeModal = useManagementModalReturn();

  return (
    <StudentCreatePage
      api={StudentApi}
      classRooms={classRooms}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      userApi={userManagementApi}
    />
  );
}
