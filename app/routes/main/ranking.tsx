import { Outlet, useLoaderData } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { parseRankingListUrl } from "~/features/ranking/application/ranking-list-url";
import { loadRankingListPage } from "~/features/ranking/application/ranking-loaders";
import { RankingPage } from "~/features/ranking/pages/RankingPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("ランキング管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const limit = 10;
  const { page, search } = parseRankingListUrl(searchParams);

  return loadRankingListPage({
    limit,
    offset: (page - 1) * limit,
    search: search || undefined,
  });
}

export default function RankingRoute() {
  const { limit, offset, rankings, total } =
    useLoaderData<typeof clientLoader>();
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
      <Outlet />
    </>
  );
}
