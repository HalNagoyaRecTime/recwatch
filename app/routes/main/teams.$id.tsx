import { useLoaderData } from "react-router";

import { TeamDetailPage } from "~/features/team/pages/TeamDetailPage";
import { getTeam } from "~/features/team/mock/team-store";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チーム詳細") }];
}

export async function clientLoader({ params }: { params: { id?: string } }) {
  const id = Number(params.id);
  const team = Number.isInteger(id) ? getTeam(id) : null;
  if (!team) throw new Response("Not Found", { status: 404 });
  return { team };
}

export default function TeamDetailRoute() {
  const { team } = useLoaderData<typeof clientLoader>();
  return <TeamDetailPage team={team} />;
}
