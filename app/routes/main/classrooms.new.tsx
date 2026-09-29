import { useLoaderData, useRevalidator } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";
import { loadActiveTeacherOptions } from "~/features/teachers/application/teacher-loaders";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("クラスの新規登録") }];
}

export async function clientLoader() {
  const teacherOptions = await loadActiveTeacherOptions();
  return {
    teacherOptions,
  };
}

export default function ClassRoomCreateRoute() {
  const { teacherOptions } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  return (
    <ClassRoomCreatePage
      api={ClassRoomApi}
      onRevalidate={() => revalidator.revalidate()}
      teacherOptions={teacherOptions}
    />
  );
}
