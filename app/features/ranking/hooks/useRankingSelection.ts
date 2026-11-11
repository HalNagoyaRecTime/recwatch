import { useCallback, useState } from "react";

/**
 * ランキング一覧のチーム選択状態。選択は一覧（Table）と一括得点入力
 * （Dialog）の両方から参照・更新されるため、hookとして調整する。
 */
export function useRankingSelection() {
  const [selectedTeamIds, setSelectedTeamIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  const toggleTeam = useCallback((teamId: number) => {
    setSelectedTeamIds((current) => {
      const next = new Set(current);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }, []);

  const removeTeams = useCallback((teamIds: readonly number[]) => {
    if (teamIds.length === 0) return;
    setSelectedTeamIds((current) => {
      const next = new Set(current);
      for (const teamId of teamIds) next.delete(teamId);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedTeamIds(new Set());
  }, []);

  return { clearAll, removeTeams, selectedTeamIds, toggleTeam };
}
