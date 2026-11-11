import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import {
  parseRankingListUrl,
  updateRankingListUrl,
} from "~/features/ranking/application/ranking-list-url";
import { RankingBulkScoreDialog } from "~/features/ranking/components/RankingBulkScoreDialog";
import { RankingTable } from "~/features/ranking/components/RankingTable";
import { useRankingSelection } from "~/features/ranking/hooks/useRankingSelection";
import type { Ranking } from "~/features/ranking/model/ranking";

type RankingPageProps = {
  limit: number;
  offset: number;
  onRevalidate: () => Promise<void> | void;
  rankings: readonly Ranking[];
  total: number;
};

export function RankingPage({
  limit,
  offset,
  onRevalidate,
  rankings,
  total,
}: RankingPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search } = parseRankingListUrl(searchParams);
  const { clearAll, removeTeams, selectedTeamIds, toggleTeam } =
    useRankingSelection();
  // 開いた時点の選択を固定する。保存成功で選択が減っても、完了表示を
  // 出し切るまでモーダル自体は閉じないようにするため。
  const [bulkEditRankings, setBulkEditRankings] = useState<
    readonly Ranking[] | null
  >(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const visibleTeamIds = rankings.map((ranking) => ranking.teamId);
  const selectedRankings = rankings.filter((ranking) =>
    selectedTeamIds.has(ranking.teamId)
  );

  // 表示中の一覧（検索条件・ページ）が変わったら、選択済みチームも一旦解除する。
  useEffect(() => {
    clearAll();
  }, [search, currentPage, clearAll]);

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
      <div className="border-border-subtle bg-surface-muted app-rounded flex flex-wrap items-center justify-between gap-3 border p-3">
        <p className="text-text-base text-sm">
          {selectedRankings.length === 0
            ? "チームを選択すると、得点をまとめて入力できます。"
            : `選択中 ${selectedRankings.length}件（${selectedRankings
                .map((ranking) => ranking.teamName)
                .join("、")}）`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={selectedRankings.length === 0}
            onClick={() => removeTeams(visibleTeamIds)}
            size="sm"
            variant="secondary"
          >
            表示中の選択を解除
          </Button>
          <Button
            disabled={selectedRankings.length === 0}
            onClick={() => setBulkEditRankings(selectedRankings)}
            size="sm"
            variant="primary"
          >
            まとめて得点を入力
          </Button>
        </div>
      </div>
      <RankingTable
        items={rankings}
        onToggleTeam={toggleTeam}
        selectedTeamIds={selectedTeamIds}
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
      {bulkEditRankings ? (
        <RankingBulkScoreDialog
          onClose={() => setBulkEditRankings(null)}
          onSaved={(succeededTeamIds) => {
            removeTeams(succeededTeamIds);
            void onRevalidate();
          }}
          rankings={bulkEditRankings}
        />
      ) : null}
    </div>
  );
}
