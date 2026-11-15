import { useCallback, useMemo, useState } from "react";

import type { Ranking } from "~/features/ranking/model/ranking";

/**
 * ランキング一覧のチーム選択状態。選択は一覧（Table）と一括得点入力
 * （Dialog）の両方から参照・更新されるため、hookとして調整する。
 *
 * 検索やページ移動をまたいで選択を保つため、IDだけでなく選択時点の
 * チーム情報（名前・得点）も保持する。表示中のページに出ていない
 * チームも、件数表示や一括入力の対象に含められるようにするため。
 */
export function useRankingSelection() {
  const [selected, setSelected] = useState<ReadonlyMap<number, Ranking>>(
    () => new Map()
  );

  const selectedTeamIds = useMemo<ReadonlySet<number>>(
    () => new Set(selected.keys()),
    [selected]
  );
  const selectedRankings = useMemo<readonly Ranking[]>(
    () => Array.from(selected.values()),
    [selected]
  );

  const toggleTeam = useCallback((ranking: Ranking) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(ranking.teamId)) next.delete(ranking.teamId);
      else next.set(ranking.teamId, ranking);
      return next;
    });
  }, []);

  const removeTeams = useCallback((teamIds: readonly number[]) => {
    if (teamIds.length === 0) return;
    setSelected((current) => {
      const next = new Map(current);
      for (const teamId of teamIds) next.delete(teamId);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelected(new Map());
  }, []);

  /**
   * 再取得した一覧の内容で、選択中チームの情報（得点など）を最新にする。
   * 選択していないチームは追加しない。
   */
  const syncTeams = useCallback((rankings: readonly Ranking[]) => {
    setSelected((current) => {
      let next: Map<number, Ranking> | null = null;
      for (const ranking of rankings) {
        const stored = current.get(ranking.teamId);
        if (!stored || isSameRanking(stored, ranking)) continue;
        next ??= new Map(current);
        next.set(ranking.teamId, ranking);
      }
      return next ?? current;
    });
  }, []);

  return {
    clearAll,
    removeTeams,
    selectedRankings,
    selectedTeamIds,
    syncTeams,
    toggleTeam,
  };
}

function isSameRanking(a: Ranking, b: Ranking) {
  return a.rank === b.rank && a.score === b.score && a.teamName === b.teamName;
}
