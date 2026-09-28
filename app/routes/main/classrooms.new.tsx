import { useRouteLoaderData } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";
import { createPageTitle } from "~/lib/page-title";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import type { clientLoader as parentClientLoader } from "./classrooms";

export function meta() {
  return [{ title: createPageTitle("クラスの新規登録") }];
}

export default function ClassRoomCreateRoute() {
  const { teacherOptions } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.classrooms
  )!;
  const closeModal = useManagementModalReturn();
  return (
    <ClassRoomCreatePage
      api={ClassRoomApi}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacherOptions={teacherOptions}
    />
  );
}
