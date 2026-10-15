import { createPageTitle } from "~/lib/page-title";
import { TeacherApi } from "~/features/teachers/api";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("教官の新規登録") }];
}

export default function TeacherCreateRoute() {
  const classRoomOptions = useManagementRouteOptions<ClassRoomOption>();
  const closeModal = useManagementModalReturn();
  return (
    <TeacherCreatePage
      api={TeacherApi}
      classRoomOptions={classRoomOptions}
      classRooms={classRoomOptions.items}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
    />
  );
}
