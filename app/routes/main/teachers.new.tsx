import { useLoaderData } from "react-router";

import { createPageTitle } from "~/config/app";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import type { ClassRoomOption } from "~/features/teachers/model/teacher";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";

export function meta() {
  return [{ title: createPageTitle("教官の新規登録") }];
}

export async function clientLoader() {
  const classRooms = await getClassRoomData();
  const options: ClassRoomOption[] = classRooms.map((classRoom) => ({
    classRoomId: classRoom.classRoomId,
    className: classRoom.classRoomName,
  }));

  return { classRooms: options };
}

export default function TeacherCreateRoute() {
  const { classRooms } = useLoaderData<typeof clientLoader>();
  return <TeacherCreatePage classRooms={classRooms} />;
}
