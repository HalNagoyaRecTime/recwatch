import { useLoaderData } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeacherApi } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";
import { parseTeacherId } from "~/features/teachers/application/teacher-loaders";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";

export function meta() {
  return [{ title: createPageTitle("教官情報の編集") }];
}

export async function clientLoader({
  params,
}: {
  params: { teacherId?: string };
}) {
  const teacherId = parseTeacherId(params.teacherId);
  const [teacherDto, classRooms] = await Promise.all([
    TeacherApi.getTeacherById(teacherId),
    getClassRoomData(),
  ]);

  const classRoomOptions: ClassRoomOption[] = classRooms.map((classRoom) => ({
    classRoomId: classRoom.classRoomId,
    className: classRoom.classRoomName,
  }));

  return {
    classRooms: classRoomOptions,
    teacher: toTeacherRow(teacherDto),
  };
}

export default function TeacherEditRoute() {
  const { classRooms, teacher } = useLoaderData<typeof clientLoader>();
  return <TeacherEditPage classRooms={classRooms} teacher={teacher} />;
}
