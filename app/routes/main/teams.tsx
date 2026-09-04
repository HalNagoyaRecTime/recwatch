import { Outlet } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getTeams } from "~/features/team/mock/team-store";
import { TeamPage } from "~/features/team/pages/TeamPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チーム管理") }];
}

export async function clientLoader() {
  return { teams: getTeams() };
}

export default function TeamsRoute() {
  return (
    <>
      <PageLayout>
        <PagePadding>
          <TeamPage teams={getTeams()} />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
