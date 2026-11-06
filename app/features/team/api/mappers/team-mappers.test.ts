import { describe, expect, it } from "vitest";

import { toTeam } from "~/features/team/api/mappers/team-mappers";

describe("toTeam", () => {
  it("DTOのsnake_caseを画面用のModelへ変換する", () => {
    expect(
      toTeam({
        team_id: 3,
        team_name: "赤組",
        registered_classes: ["1A", "1B"],
        scores: 120,
        created_at: "2026-09-01T09:00:00Z",
        updated_at: "2026-09-05T12:00:00Z",
      })
    ).toEqual({
      id: 3,
      name: "赤組",
      registeredClasses: ["1A", "1B"],
      score: 120,
      registeredAt: "2026-09-01T09:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z",
    });
  });

  it("APIが返すタイムゾーンなしの日時をUTCとして扱う", () => {
    // rectime-apiはSQLiteのCURRENT_TIMESTAMP(UTC)をそのまま返す
    const team = toTeam({
      team_id: 1,
      team_name: "1年Aクラス(11A)",
      registered_classes: ["11A"],
      scores: 0,
      created_at: "2026-10-16 12:20:58",
      updated_at: "2026-10-16 12:20:58",
    });

    expect(team.registeredAt).toBe("2026-10-16T12:20:58.000Z");
    expect(team.updatedAt).toBe("2026-10-16T12:20:58.000Z");
  });
});
