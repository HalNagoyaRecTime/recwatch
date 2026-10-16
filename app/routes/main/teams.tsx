import { Outlet, useLoaderData } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { parseTeamListUrl } from "~/features/team/application/team-list-url";
import { loadTeamListPage } from "~/features/team/application/team-loaders";
import { TeamPage } from "~/features/team/pages/TeamPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("チーム管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const limit = 10;
  const { page, search, sortBy, sortOrder } = parseTeamListUrl(searchParams);

  return loadTeamListPage({
    limit,
    offset: (page - 1) * limit,
    search: search || undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
  });
}

export default function TeamsRoute() {
  const { limit, offset, teams, total } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <PageLayout>
        <PagePadding>
          <TeamPage limit={limit} offset={offset} teams={teams} total={total} />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
