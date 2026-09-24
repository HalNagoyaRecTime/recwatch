import { useLoaderData } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";

export function meta() {
  return [{ title: createPageTitle("教官の新規登録") }];
}

export async function clientLoader() {
  const classRooms = await getClassRoomData();
  const options: ClassRoomOption[] = classRooms.map((classRoom) => ({
    classRoomId: classRoom.classRoomId,
    classCode: classRoom.classCode,
    className: classRoom.className,
  }));

  return { classRooms: options };
}

export default function TeacherCreateRoute() {
  const { classRooms } = useLoaderData<typeof clientLoader>();
  return <TeacherCreatePage classRooms={classRooms} />;
}
