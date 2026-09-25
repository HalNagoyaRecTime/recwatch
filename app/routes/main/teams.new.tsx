import { useLoaderData } from "react-router";

import { createPageTitle } from "~/lib/page-title";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeamCreatePage } from "~/features/team/pages/TeamCreatePage";
import type { TeamClassOption } from "~/features/team/model/team-class-option";

export function meta() {
  return [{ title: createPageTitle("チームの新規登録") }];
}

export async function clientLoader() {
  const classRooms = await getClassRoomData();
  const availableClasses: TeamClassOption[] = classRooms.map((classRoom) => ({
    code: classRoom.classRoomCode,
    id: classRoom.classRoomId,
    name: classRoom.classRoomName,
  }));
  return { availableClasses };
}

export default function TeamCreateRoute() {
  const { availableClasses } = useLoaderData<typeof clientLoader>();
  return <TeamCreatePage availableClasses={availableClasses} />;
}
