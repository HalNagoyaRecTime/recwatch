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
      scores: 120,
      registeredAt: "2026-09-01T09:00:00Z",
      updatedAt: "2026-09-05T12:00:00Z",
    });
  });
});
