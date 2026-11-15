import { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { findRankingPage } from "~/features/ranking/application/find-ranking-page";
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
  const {
    clearAll,
    removeTeams,
    selectedRankings,
    selectedTeamIds,
    syncTeams,
    toggleTeam,
  } = useRankingSelection();
  // 開いた時点の選択を固定する。保存成功で選択が減っても、完了表示を
  // 出し切るまでモーダル自体は閉じないようにするため。
  const [bulkEditRankings, setBulkEditRankings] = useState<
    readonly Ranking[] | null
  >(null);

  const [jumpError, setJumpError] = useState<string | null>(null);
  // チーム名から別ページへ移動したあと、画面の真ん中へスクロールするチーム
  const scrollTargetTeamIdRef = useRef<number | null>(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  // 検索やページ移動をしても選択は保つ。再取得した一覧に選択中のチームが
  // あれば、得点などをその内容で最新にする。
  useEffect(() => {
    syncTeams(rankings);
  }, [rankings, syncTeams]);

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateRankingListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  /**
   * 選択中のチーム名から、そのチームのチェックボックスがあるページへ移動する。
   * 表示中の一覧に載っていればページはそのまま。載っていなければ検索を外し、
   * 検索なしの一覧でそのチームが載っているページへ移る。どちらの場合も、
   * そのチームの行を画面の真ん中へスクロールする。
   */
  async function jumpToTeam(teamId: number) {
    setJumpError(null);
    scrollTargetTeamIdRef.current = null;
    if (rankings.some((ranking) => ranking.teamId === teamId)) {
      scrollToTeam(teamId);
      return;
    }
    try {
      const page = await findRankingPage(teamId, limit);
      if (page === null) {
        setJumpError("このチームは一覧に見つかりませんでした。");
        return;
      }
      scrollTargetTeamIdRef.current = teamId;
      setSearchParams((current) =>
        updateRankingListUrl(current, { page, search: "" })
      );
    } catch {
      setJumpError("チームの表示ページへ移動できませんでした。");
    }
  }

  // 移動先のページが表示されたら、そのチームの行を画面の真ん中へ寄せる。
  // ページ移動時のスクロール位置の復元（ScrollRestoration）より後に動くよう、
  // 一覧の描画後（useEffect）に行う。
  useEffect(() => {
    const teamId = scrollTargetTeamIdRef.current;
    if (teamId !== null && scrollToTeam(teamId)) {
      scrollTargetTeamIdRef.current = null;
    }
  }, [rankings]);

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
        <div className="space-y-1">
          <p className="text-text-base text-sm">
            {selectedRankings.length === 0 ? (
              "チームを選択すると、得点をまとめて入力できます。"
            ) : (
              <>
                {`選択中 ${selectedRankings.length}件（`}
                {selectedRankings.map((ranking, index) => (
                  <Fragment key={ranking.teamId}>
                    {index > 0 ? "、" : null}
                    <button
                      aria-label={`${ranking.teamName}の表示ページへ移動`}
                      className="hover:text-brand-primary cursor-pointer text-sky-700 underline underline-offset-2 dark:text-sky-300"
                      onClick={() => void jumpToTeam(ranking.teamId)}
                      title="このチームの表示ページへ移動"
                      type="button"
                    >
                      {ranking.teamName}
                    </button>
                  </Fragment>
                ))}
                ）
              </>
            )}
          </p>
          {jumpError ? (
            <p className="text-tone-danger-text text-sm" role="alert">
              {jumpError}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={selectedRankings.length === 0}
            onClick={clearAll}
            size="sm"
            variant="secondary"
          >
            すべての選択を解除
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

/** チームの行を画面の真ん中へスクロールする。行が見つかれば true を返す。 */
function scrollToTeam(teamId: number) {
  const target = document.querySelector<HTMLElement>(
    `[data-ranking-team-id="${teamId}"]`
  );
  if (!target) return false;
  target.scrollIntoView?.({ behavior: "smooth", block: "center" });
  return true;
}
