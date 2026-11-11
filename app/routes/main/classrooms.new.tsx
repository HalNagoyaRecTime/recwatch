import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomTeacherOption } from "~/features/classRoom/components/ClassRoomForm";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";
import { createPageTitle } from "~/lib/page-title";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("クラスの新規登録") }];
}

export default function ClassRoomCreateRoute() {
  const teacherOptions = useManagementRouteOptions<ClassRoomTeacherOption>();
  const closeModal = useManagementModalReturn();
  return (
    <ClassRoomCreatePage
      api={ClassRoomApi}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacherOptionState={teacherOptions}
      teacherOptions={teacherOptions.items}
    />
  );
}
