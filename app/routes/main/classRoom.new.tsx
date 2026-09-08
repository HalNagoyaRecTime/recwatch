import { useLoaderData, useRevalidator } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";
import { TeacherApi } from "~/features/teachers/api";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("クラスの新規登録") }];
}

export async function clientLoader() {
  const teachers = await TeacherApi.getActiveTeachers();
  return {
    teacherOptions: teachers.items.map((teacher) => ({
      displayName: teacher.display_name,
      teacherId: teacher.teacher_id,
    })),
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
