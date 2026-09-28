import { useLoaderData, useRouteLoaderData } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import { ClassRoomEditPage } from "~/features/classRoom/pages/ClassRoomEditPage";
import { createPageTitle } from "~/lib/page-title";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import { useManagementModalReturn } from "~/routes/main/useManagementModalNavigation";
import type { clientLoader as parentClientLoader } from "./classrooms";

export function meta() {
  return [{ title: createPageTitle("クラス情報の編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { classRoomId?: string };
}) {
  const classRoomId = Number(params.classRoomId);
  if (!Number.isInteger(classRoomId) || classRoomId <= 0) {
    throw new Response("クラスが見つかりません。", { status: 404 });
  }

  return { classRoom: await ClassRoomApi.getClassRoomById(classRoomId) };
}

export default function ClassRoomEditRoute() {
  const { classRoom } = useLoaderData<typeof clientLoader>();
  const { teacherOptions } = useRouteLoaderData<typeof parentClientLoader>(
    managementRouteIds.classrooms
  )!;
  const closeModal = useManagementModalReturn();

  return (
    <ClassRoomEditPage
      api={ClassRoomApi}
      classRoom={classRoom}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacherOptions={teacherOptions}
    />
  );
}
