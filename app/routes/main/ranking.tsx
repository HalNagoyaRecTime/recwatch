import { Outlet } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { getRankings } from "~/features/ranking/mock/ranking-store";
import { RankingPage } from "~/features/ranking/pages/RankingPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("ランキング管理") }];
}

export default function RankingRoute() {
  return (
    <>
      <PageLayout>
        <PagePadding>
          <RankingPage rankings={getRankings()} />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
