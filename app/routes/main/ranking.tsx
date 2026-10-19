import { Outlet, useLoaderData, useRouteError } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { parseRankingListUrl } from "~/features/ranking/application/ranking-list-url";
import { loadRankingListPage } from "~/features/ranking/application/ranking-loaders";
import { RankingPage } from "~/features/ranking/pages/RankingPage";
import { createPageTitle } from "~/lib/page-title";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";
import { useManagementModalNavigation } from "~/routes/main/useManagementModalNavigation";

const RANKING_LIST_LIMIT = 10;

export function meta() {
  return [{ title: createPageTitle("ランキング管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const { page, search } = parseRankingListUrl(searchParams);

  return loadRankingListPage({
    limit: RANKING_LIST_LIMIT,
    offset: (page - 1) * RANKING_LIST_LIMIT,
    search: search || undefined,
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

export default function RankingRoute() {
  const { limit, offset, rankings, total } =
    useLoaderData<typeof clientLoader>();
  const closeModal = useManagementModalNavigation("/ranking");

  return (
    <>
      <PageLayout>
        <PagePadding>
          <RankingPage
            limit={limit}
            offset={offset}
            rankings={rankings}
            total={total}
          />
        </PagePadding>
      </PageLayout>
      <Outlet context={closeModal} />
    </>
  );
}
