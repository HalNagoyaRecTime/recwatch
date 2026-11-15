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
import { TeamApi } from "~/features/team/api";
import { ApiClientError } from "~/lib/api-client-error";
import { useRankingSelection } from "~/features/ranking/hooks/useRankingSelection";
import type { Ranking } from "~/features/ranking/model/ranking";

// 選択中のチーム名は、この件数を超えたら「ほか○件」とまとめる
const SELECTED_NAME_PREVIEW_COUNT = 8;

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

  const [actionError, setActionError] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [isPreparingBulkEdit, setIsPreparingBulkEdit] = useState(false);
  const [isSelectionExpanded, setIsSelectionExpanded] = useState(false);
  // チーム名から別ページへ移動したあと、画面の真ん中へスクロールするチームと
  // その移動先のページ（検索なし）
  const scrollTargetRef = useRef<{ page: number; teamId: number } | null>(null);

  const visibleSelectedRankings = isSelectionExpanded
    ? selectedRankings
    : selectedRankings.slice(0, SELECTED_NAME_PREVIEW_COUNT);
  const hiddenSelectedCount =
    selectedRankings.length - visibleSelectedRankings.length;

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
    setActionError(null);
    scrollTargetRef.current = null;
    if (rankings.some((ranking) => ranking.teamId === teamId)) {
      scrollToTeam(teamId);
      return;
    }
    try {
      const page = await findRankingPage(teamId, limit);
      if (page === null) {
        setActionError("このチームは一覧に見つかりませんでした。");
        return;
      }
      // 位置を調べている間に順位が変わり、移動先が今と同じページになった
      // 場合は、URLが変わらず再描画もされないので、何もしない
      if (page === currentPage && search === "") return;
      scrollTargetRef.current = { page, teamId };
      setSearchParams((current) =>
        updateRankingListUrl(current, { page, search: "" })
      );
    } catch {
      setActionError("チームの表示ページへ移動できませんでした。");
    }
  }

  // 移動先のページが表示されたら、そのチームの行を画面の真ん中へ寄せる。
  // ページ移動時のスクロール位置の復元（ScrollRestoration）より後に動くよう、
  // 一覧の描画後（useEffect）に行う。
  // 見つからなくても（移動中に順位が変わった、別のページへ移ったなど）
  // 1回描画したらクリアする。残すと、あとで偶然そのチームが載っている
  // ページを開いたときに勝手にスクロールしてしまうため。
  // 移動先とは別のページ（移動が終わる前にユーザーが別のページへ移ったなど）
  // が表示された場合は、スクロールせずにクリアだけする。
  useEffect(() => {
    const target = scrollTargetRef.current;
    if (target === null) return;
    scrollTargetRef.current = null;
    if (target.page === currentPage && search === "") {
      scrollToTeam(target.teamId);
    }
  }, [rankings, currentPage, search]);

  /**
   * まとめ入力を開く前に、選択中チームの最新の得点を取り直す。
   * 別ページで選んだチームは選択した時点の得点のままなので、古い得点を
   * 基準にすると、通信エラー時の加算済み判定（二重加算の防止）や
   * 「更新後の得点」の表示がずれるため。
   * 削除されていたチームは選択から外す。
   */
  async function openBulkEdit() {
    setActionError(null);
    setSelectionNotice(null);
    setIsPreparingBulkEdit(true);
    try {
      const results = await Promise.allSettled(
        selectedRankings.map((ranking) => TeamApi.getTeamById(ranking.teamId))
      );
      const latestRankings: Ranking[] = [];
      const deletedRankings: Ranking[] = [];
      for (const [index, result] of results.entries()) {
        const ranking = selectedRankings[index];
        if (result.status === "fulfilled") {
          latestRankings.push({
            ...ranking,
            score: result.value.score,
            teamName: result.value.name,
          });
        } else if (
          result.reason instanceof ApiClientError &&
          result.reason.status === 404
        ) {
          deletedRankings.push(ranking);
        } else {
          setActionError(
            "最新の得点を取得できませんでした。時間をおいて再度お試しください。"
          );
          return;
        }
      }

      syncTeams(latestRankings);
      if (deletedRankings.length > 0) {
        removeTeams(deletedRankings.map((ranking) => ranking.teamId));
        setSelectionNotice(
          `削除されたチーム（${deletedRankings
            .map((ranking) => ranking.teamName)
            .join("、")}）を選択から外しました。`
        );
      }
      if (latestRankings.length > 0) setBulkEditRankings(latestRankings);
    } finally {
      setIsPreparingBulkEdit(false);
    }
  }

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
                {visibleSelectedRankings.map((ranking, index) => (
                  <Fragment key={ranking.teamId}>
                    {index > 0 ? "、" : null}
                    <button
                      aria-label={`${ranking.teamName}の表示ページへ移動`}
                      className="text-text-link hover:text-brand-primary cursor-pointer underline underline-offset-2"
                      onClick={() => void jumpToTeam(ranking.teamId)}
                      title="このチームの表示ページへ移動"
                      type="button"
                    >
                      {ranking.teamName}
                    </button>
                  </Fragment>
                ))}
                {hiddenSelectedCount > 0 ? (
                  <>
                    {"、"}
                    <button
                      className="text-text-muted hover:text-text-base cursor-pointer underline underline-offset-2"
                      onClick={() => setIsSelectionExpanded(true)}
                      type="button"
                    >
                      {`ほか${hiddenSelectedCount}件`}
                    </button>
                  </>
                ) : null}
                ）
                {isSelectionExpanded &&
                selectedRankings.length > SELECTED_NAME_PREVIEW_COUNT ? (
                  <button
                    className="text-text-muted hover:text-text-base ml-2 cursor-pointer underline underline-offset-2"
                    onClick={() => setIsSelectionExpanded(false)}
                    type="button"
                  >
                    折りたたむ
                  </button>
                ) : null}
              </>
            )}
          </p>
          {actionError ? (
            <p className="text-tone-danger-text text-sm" role="alert">
              {actionError}
            </p>
          ) : null}
          {selectionNotice ? (
            <p className="text-text-muted text-sm" role="status">
              {selectionNotice}
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
            disabled={selectedRankings.length === 0 || isPreparingBulkEdit}
            onClick={() => void openBulkEdit()}
            size="sm"
            variant="primary"
          >
            {isPreparingBulkEdit
              ? "最新の得点を確認中..."
              : "まとめて得点を入力"}
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
