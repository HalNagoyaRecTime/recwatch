import { useLoaderData, useRouteError } from "react-router";

import { StudentApi } from "~/features/students/api";
import { parseStudentId } from "~/features/students/application/student-loaders";
import { StudentEditPage } from "~/features/students/pages/StudentEditPage";
import type { StudentClassRoomOption } from "~/features/students/model/student";
import { createPageTitle } from "~/lib/page-title";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";
import { userManagementApi } from "~/features/user-management/api";

export function meta() {
  return [{ title: createPageTitle("学生情報の編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { studentId?: string };
}) {
  const studentId = parseStudentId(params.studentId);
  return { student: await StudentApi.getStudentById(studentId) };
}

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={closeModal}
      title="学生情報を読み込めません"
    />
  );
}

export default function StudentEditRoute() {
  const { student } = useLoaderData<typeof clientLoader>();
  const classRoomOptions = useManagementRouteOptions<StudentClassRoomOption>();
  const closeModal = useManagementModalReturn();

  return (
    <StudentEditPage
      api={StudentApi}
      classRoomOptions={classRoomOptions}
      classRooms={classRoomOptions.items}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      student={student}
      userApi={userManagementApi}
    />
  );
}
