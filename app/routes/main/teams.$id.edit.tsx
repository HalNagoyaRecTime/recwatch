import { useLoaderData } from "react-router";

import { TeamEditPage } from "~/features/team/pages/TeamEditPage";
import { mockTeamClasses } from "~/features/team/mock/team-class-data";
import { getTeam } from "~/features/team/mock/team-store";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チームの編集") }];
}

export async function clientLoader({ params }: { params: { id?: string } }) {
  const id = Number(params.id);
  const team = Number.isInteger(id) ? getTeam(id) : null;
  if (!team) throw new Response("Not Found", { status: 404 });
  return { team };
}

export default function TeamEditRoute() {
  const { team } = useLoaderData<typeof clientLoader>();
  return <TeamEditPage availableClasses={mockTeamClasses} team={team} />;
}
