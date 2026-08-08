import { useLoaderData } from "react-router";
import { TeacherApi } from "~/features/teachers/api";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";

export function meta() {
  return [{ title: "クラス割り当て | recwatch" }];
}

export async function clientLoader({
  params,
}: {
  params: { teacherId: string };
}) {
  const teacherId = Number(params.teacherId);
  if (!Number.isInteger(teacherId) || teacherId <= 0) {
    throw new Response("教官IDが不正です。", { status: 400 });
  }

  const [teacher, classRooms] = await Promise.all([
    TeacherApi.getTeacherById(teacherId),
    getClassRoomData(),
  ]);

  return {
    teacher: toTeacherRow(teacher),
    classRooms: classRooms.map((c) => ({
      classRoomId: c.classRoomId,
      className: c.classRoomName,
    })),
  };
}

export default function TeacherEditRoute() {
  const { teacher, classRooms } = useLoaderData<typeof clientLoader>();

  return <TeacherEditPage teacher={teacher} classRooms={classRooms} />;
}
