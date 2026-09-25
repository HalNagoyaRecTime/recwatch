import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import {
  parseRankingListUrl,
  updateRankingListUrl,
} from "~/features/ranking/application/ranking-list-url";
import { RankingTable } from "~/features/ranking/components/RankingTable";
import type { Ranking } from "~/features/ranking/model/ranking";

type RankingPageProps = {
  limit: number;
  offset: number;
  rankings: readonly Ranking[];
  total: number;
};

export function RankingPage({
  limit,
  offset,
  rankings,
  total,
}: RankingPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search } = parseRankingListUrl(searchParams);

  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateRankingListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateUrl(updates: Parameters<typeof updateRankingListUrl>[1]) {
    setSearchParams(updateRankingListUrl(searchParams, updates));
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        description="チームごとのスコアと順位を管理します"
        title="ランキング管理"
      />
      <SearchField
        ariaLabel="ランキングを検索"
        onValueChange={(value) => updateUrl({ page: 1, search: value })}
        placeholder="チーム名で検索..."
        value={search}
      />
      <RankingTable
        items={rankings}
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateUrl({ page: nextPage })}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={total}
          />
        }
      />
    </div>
  );
}
