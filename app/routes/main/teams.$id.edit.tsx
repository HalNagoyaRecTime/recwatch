import { useLoaderData } from "react-router";

import { TeamEditPage } from "~/features/team/pages/TeamEditPage";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";
import { TeamApi } from "~/features/team/api";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チームの編集") }];
}

export async function clientLoader({ params }: { params: { id?: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    throw new Response("Not Found", { status: 404 });
  }

  const [team, classRooms] = await Promise.all([
    TeamApi.getTeamById(id),
    getClassRoomData(),
  ]);
  const availableClasses: TeamClassOption[] = classRooms.map((classRoom) => ({
    code: classRoom.classRoomCode,
    id: classRoom.classRoomId,
    name: classRoom.classRoomName,
  }));

  return { availableClasses, team };
}

export default function TeamEditRoute() {
  const { availableClasses, team } = useLoaderData<typeof clientLoader>();
  return <TeamEditPage availableClasses={availableClasses} team={team} />;
}
