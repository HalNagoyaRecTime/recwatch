import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRankingSelection } from "~/features/ranking/hooks/useRankingSelection";

describe("useRankingSelection", () => {
  it("チームの選択と解除を切り替える", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => result.current.toggleTeam(1));
    expect(result.current.selectedTeamIds.has(1)).toBe(true);

    act(() => result.current.toggleTeam(1));
    expect(result.current.selectedTeamIds.has(1)).toBe(false);
  });

  it("指定したチームだけを選択から外す", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => {
      result.current.toggleTeam(1);
      result.current.toggleTeam(2);
      result.current.toggleTeam(3);
    });

    act(() => result.current.removeTeams([2, 3]));

    expect(Array.from(result.current.selectedTeamIds)).toEqual([1]);
  });

  it("全選択を解除する", () => {
    const { result } = renderHook(() => useRankingSelection());

    act(() => {
      result.current.toggleTeam(1);
      result.current.toggleTeam(2);
    });
    act(() => result.current.clearAll());

    expect(result.current.selectedTeamIds.size).toBe(0);
  });
});
