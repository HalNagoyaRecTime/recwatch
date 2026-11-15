import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRankingSelection } from "~/features/ranking/hooks/useRankingSelection";
import type { Ranking } from "~/features/ranking/model/ranking";

function ranking(teamId: number, score = 0): Ranking {
  return { rank: teamId, teamId, teamName: `チーム${teamId}`, score };
}

describe("useRankingSelection", () => {
  it("チームの選択と解除を切り替える", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => result.current.toggleTeam(ranking(1)));
    expect(result.current.selectedTeamIds.has(1)).toBe(true);
    expect(result.current.selectedRankings).toEqual([ranking(1)]);

    act(() => result.current.toggleTeam(ranking(1)));
    expect(result.current.selectedTeamIds.has(1)).toBe(false);
    expect(result.current.selectedRankings).toEqual([]);
  });

  it("指定したチームだけを選択から外す", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => {
      result.current.toggleTeam(ranking(1));
      result.current.toggleTeam(ranking(2));
      result.current.toggleTeam(ranking(3));
    });

    act(() => result.current.removeTeams([2, 3]));

    expect(Array.from(result.current.selectedTeamIds)).toEqual([1]);
  });

  it("全選択を解除する", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => {
      result.current.toggleTeam(ranking(1));
      result.current.toggleTeam(ranking(2));
    });
    act(() => result.current.clearAll());

    expect(result.current.selectedTeamIds.size).toBe(0);
  });

  it("再取得した一覧で選択中チームの得点を更新し、未選択のチームは追加しない", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => result.current.toggleTeam(ranking(1, 10)));
    act(() => result.current.syncTeams([ranking(1, 30), ranking(2, 50)]));

    expect(result.current.selectedRankings).toEqual([ranking(1, 30)]);
  });

  it("内容が変わらなければ選択状態を作り直さない", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => result.current.toggleTeam(ranking(1, 10)));
    const before = result.current.selectedRankings;
    act(() => result.current.syncTeams([ranking(1, 10)]));

    expect(result.current.selectedRankings).toBe(before);
  });
});
