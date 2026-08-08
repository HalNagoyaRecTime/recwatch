import { useLoaderData } from "react-router";

import { ClassRoomApi } from "~/features/teachers/api";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";

export function meta() {
  return [{ title: "教官の新規登録 | recwatch" }];
}

export async function clientLoader() {
  const page = await ClassRoomApi.getClassRooms();
  const classRooms: ClassRoomOption[] = page.classrooms.map((classRoom) => ({
    classRoomId: classRoom.class_room_id,
    className: classRoom.class_name,
  }));

  return { classRooms };
}

export default function TeacherCreateRoute() {
  const { classRooms } = useLoaderData<typeof clientLoader>();

  return <TeacherCreatePage classRooms={classRooms} />;
}
