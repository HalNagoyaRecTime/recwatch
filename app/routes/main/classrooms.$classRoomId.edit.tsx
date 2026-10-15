import { useLoaderData, useRouteError } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomTeacherOption } from "~/features/classRoom/components/ClassRoomForm";
import { ClassRoomEditPage } from "~/features/classRoom/pages/ClassRoomEditPage";
import { createPageTitle } from "~/lib/page-title";
import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("クラス情報の編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { classRoomId?: string };
}) {
  const classRoomId = parsePositiveIntegerRouteParam(params.classRoomId);
  if (classRoomId === null) {
    throw new Response("クラスが見つかりません。", { status: 404 });
  }

  return { classRoom: await ClassRoomApi.getClassRoomById(classRoomId) };
}

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={closeModal}
      title="クラス情報を読み込めません"
    />
  );
}

export default function ClassRoomEditRoute() {
  const { classRoom } = useLoaderData<typeof clientLoader>();
  const teacherOptions = useManagementRouteOptions<ClassRoomTeacherOption>();
  const closeModal = useManagementModalReturn();

  return (
    <ClassRoomEditPage
      api={ClassRoomApi}
      classRoom={classRoom}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacherOptionState={teacherOptions}
      teacherOptions={teacherOptions.items}
    />
  );
}
