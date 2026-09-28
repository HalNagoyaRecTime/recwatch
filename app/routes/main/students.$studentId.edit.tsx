import { useLoaderData, useRouteLoaderData } from "react-router";

import { StudentApi } from "~/features/students/api";
import { parseStudentId } from "~/features/students/application/student-loaders";
import { StudentEditPage } from "~/features/students/pages/StudentEditPage";
import { createPageTitle } from "~/lib/page-title";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import { userManagementApi } from "~/features/user-management/api";
import type { clientLoader as parentClientLoader } from "./students";

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

export default function StudentEditRoute() {
  const { student } = useLoaderData<typeof clientLoader>();
  const { classRooms } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.students
  )!;
  const closeModal = useManagementModalReturn();

  return (
    <StudentEditPage
      api={StudentApi}
      classRooms={classRooms}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      student={student}
      userApi={userManagementApi}
    />
  );
}
