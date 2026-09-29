import { StudentApi } from "~/features/students/api";
import { StudentCreatePage } from "~/features/students/pages/StudentCreatePage";
import type { StudentClassRoomOption } from "~/features/students/model/student";
import { userManagementApi } from "~/features/user-management/api";
import { createPageTitle } from "~/lib/page-title";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("学生の新規登録") }];
}

export default function StudentCreateRoute() {
  const classRoomOptions = useManagementRouteOptions<StudentClassRoomOption>();
  const closeModal = useManagementModalReturn();

  return (
    <StudentCreatePage
      api={StudentApi}
      classRoomOptions={classRoomOptions}
      classRooms={classRoomOptions.items}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      userApi={userManagementApi}
    />
  );
}
