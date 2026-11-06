import { useRef } from "react";
import { useLoaderData, useRouteError } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { TeacherApi } from "~/features/teachers/api";
import { parseTeacherId } from "~/features/teachers/application/teacher-loaders";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

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

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={closeModal}
      title="教官情報を読み込めません"
    />
  );
}

export default function TeacherEditRoute() {
  const { teacher } = useLoaderData<typeof clientLoader>();
  const classRoomOptions = useManagementRouteOptions<ClassRoomOption>();
  const closeModal = useManagementModalReturn();
  // 競合が起きたら一覧も古いので、保存せずに閉じるときも再検証する。
  const hasConflict = useRef(false);
  return (
    <TeacherEditPage
      api={TeacherApi}
      classRoomOptions={classRoomOptions}
      classRooms={classRoomOptions.items}
      loadLatest={() => {
        hasConflict.current = true;
        return TeacherApi.getTeacherById(teacher.teacherId);
      }}
      onClose={() => closeModal(hasConflict.current)}
      onSaved={() => closeModal(true)}
      teacher={teacher}
    />
  );
}
