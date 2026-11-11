import {
  Outlet,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "react-router";
import { useCallback } from "react";

import { getClassRoomData } from "~/features/classRoom/application/class-room-options";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { parseTeamListUrl } from "~/features/team/application/team-list-url";
import { loadTeamListPage } from "~/features/team/application/team-loaders";
import type { TeamClassOption } from "~/features/team/model/team-class-option";
import { TeamPage } from "~/features/team/pages/TeamPage";
import { useManagementOptions } from "~/hooks/useManagementOptions";
import { createPageTitle } from "~/lib/page-title";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

const TEAM_LIST_LIMIT = 10;

export function meta() {
  return [{ title: createPageTitle("チーム管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const { page, search, sortBy, sortOrder } = parseTeamListUrl(searchParams);

  return loadTeamListPage({
    limit: TEAM_LIST_LIMIT,
    offset: (page - 1) * TEAM_LIST_LIMIT,
    search: search || undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
  });
}

export function ErrorBoundary() {
  const message = getManagementRouteErrorMessage(useRouteError());
  return (
    <PageLayout>
      <PagePadding>
        <div role="alert" className="text-tone-danger-text p-6">
          {message}
        </div>
      </PagePadding>
    </PageLayout>
  );
}

export default function TeamsRoute() {
  const { limit, offset, teams, total } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const closeModal = useManagementModalNavigation("/teams");
  const loadClassOptions = useCallback(async () => {
    const classRooms = await getClassRoomData();
    return classRooms.map((classRoom): TeamClassOption => ({
      code: classRoom.classCode,
      id: classRoom.classRoomId,
      name: classRoom.className,
    }));
  }, []);
  const classOptions = useManagementOptions(
    loadClassOptions,
    "登録クラス候補を取得できませんでした。"
  );

  return (
    <>
      <PageLayout>
        <PagePadding>
          <TeamPage
            limit={limit}
            offset={offset}
            onRevalidate={() => revalidator.revalidate()}
            teams={teams}
            total={total}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={{ closeModal, options: classOptions }} />
    </>
  );
}
