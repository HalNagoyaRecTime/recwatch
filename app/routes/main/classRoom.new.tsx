import { useLoaderData } from "react-router";

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
  return <ClassRoomCreatePage teacherOptions={teacherOptions} />;
}
