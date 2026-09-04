import { useEffect, useMemo } from "react";
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
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

const PAGE_SIZE = 10;

export function RankingPage({ rankings }: { rankings: readonly Ranking[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, search, sortBy, sortOrder } = parseRankingListUrl(searchParams);
  const filteredRankings = useMemo(() => {
    const normalizedSearch = search.toLocaleLowerCase();
    return rankings.filter(
      (ranking) =>
        !normalizedSearch ||
        ranking.teamName.toLocaleLowerCase().includes(normalizedSearch) ||
        String(ranking.rank).includes(normalizedSearch)
    );
  }, [rankings, search]);
  const sortedRankings = useMemo(
    () =>
      sortManagementTableItems(
        filteredRankings,
        sortBy && sortOrder
          ? { columnId: sortBy, direction: sortOrder }
          : undefined,
        (ranking, columnId) => {
          switch (columnId) {
            case "rank":
              return ranking.rank;
            case "teamName":
              return ranking.teamName;
            case "score":
              return ranking.score;
            case "updatedAt":
              return ranking.updatedAt;
            default:
              return null;
          }
        }
      ),
    [filteredRankings, sortBy, sortOrder]
  );
  const pageCount = Math.max(1, Math.ceil(sortedRankings.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRankings = sortedRankings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (page <= pageCount) return;
    setSearchParams(updateRankingListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [page, pageCount, searchParams, setSearchParams]);

  function updateUrl(updates: Parameters<typeof updateRankingListUrl>[1]) {
    setSearchParams(updateRankingListUrl(searchParams, updates));
  }

  function handleSortChange(columnId: string) {
    const nextSortBy = {
      rank: "rank",
      "team-name": "teamName",
      score: "score",
      "updated-at": "updatedAt",
    }[columnId];
    if (!nextSortBy) return;

    const nextSort = getNextManagementTableSort(
      sortBy && sortOrder
        ? { columnId: sortBy, direction: sortOrder }
        : undefined,
      nextSortBy
    );
    updateUrl({
      page: 1,
      sortBy: nextSort.columnId as Parameters<
        typeof updateRankingListUrl
      >[1]["sortBy"],
      sortOrder: nextSort.direction,
    });
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
        placeholder="チーム名・順位で検索..."
        value={search}
      />
      <RankingTable
        items={visibleRankings}
        onSortChange={handleSortChange}
        sort={
          sortBy && sortOrder
            ? {
                columnId: {
                  rank: "rank",
                  teamName: "team-name",
                  score: "score",
                  updatedAt: "updated-at",
                }[sortBy],
                direction: sortOrder,
              }
            : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateUrl({ page: nextPage })}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            totalItems={sortedRankings.length}
          />
        }
      />
    </div>
  );
}
