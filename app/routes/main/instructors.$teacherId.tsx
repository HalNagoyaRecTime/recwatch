import { useLoaderData } from "react-router";
import { ClassRoomApi, TeacherApi } from "~/features/instructors/api";
import { toTeacherRow } from "~/features/instructors/model/teacher";
import { TeacherClassAssignmentPage } from "~/features/instructors/pages/TeacherClassAssignmentPage";
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

  const [teacherPage, classRoomPage] = await Promise.all([
    TeacherApi.getTeachers(),
    ClassRoomApi.getClassRooms(),
  ]);

  return {
    teachers: teacherPage.items.map(toTeacherRow),
    classRooms: classRoomPage.classrooms.map((c) => ({
      classRoomId: c.class_room_id,
      className: c.class_name,
    })),
    selectedTeacherId: teacherId,
  };
}

export default function InstructorClassAssignmentRoute() {
  const { teachers, classRooms, selectedTeacherId } =
    useLoaderData<typeof clientLoader>();

  return (
    <PageLayout>
      <PagePadding>
        <TeacherClassAssignmentPage
          teachers={teachers}
          classRooms={classRooms}
          selectedTeacherId={selectedTeacherId}
        />
      </PagePadding>
    </PageLayout>
  );
}
