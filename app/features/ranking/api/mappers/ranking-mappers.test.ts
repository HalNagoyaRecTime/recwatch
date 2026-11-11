import { describe, expect, it } from "vitest";

import { toRanking } from "~/features/ranking/api/mappers/ranking-mappers";

describe("toRanking", () => {
  it("DTOのsnake_caseを画面用のModelへ変換する", () => {
    expect(
      toRanking({
        rank: 1,
        team_id: 3,
        team_name: "赤組",
        scores: 320,
      })
    ).toEqual({
      rank: 1,
      teamId: 3,
      teamName: "赤組",
      score: 320,
    });
  });
});
