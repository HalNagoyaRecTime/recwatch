import { useLoaderData } from "react-router";
import { ClassRoomApi, TeacherApi } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/model/teacher";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

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

  const [teacher, classRoomPage] = await Promise.all([
    TeacherApi.getTeacherById(teacherId),
    ClassRoomApi.getClassRooms(),
  ]);

  return {
    teacher: toTeacherRow(teacher),
    classRooms: classRoomPage.classrooms.map((c) => ({
      classRoomId: c.class_room_id,
      className: c.class_name,
    })),
  };
}

export default function TeacherEditRoute() {
  const { teacher, classRooms } = useLoaderData<typeof clientLoader>();

  return (
    <PageLayout>
      <PagePadding>
        <TeacherEditPage teacher={teacher} classRooms={classRooms} />
      </PagePadding>
    </PageLayout>
  );
}
