import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { toTeam } from "~/features/team/api/mappers/team-mappers";
import { TeamDetailPage } from "~/features/team/pages/TeamDetailPage";

describe("TeamDetailPage", () => {
  it("APIが返すタイムゾーンなしの日時を日本時間で表示する", async () => {
    // rectime-apiの実際のレスポンス形式(SQLiteのCURRENT_TIMESTAMPはUTC)
    const team = toTeam({
      team_id: 3,
      team_name: "赤組",
      registered_classes: ["1A"],
      scores: 10,
      created_at: "2026-10-16 12:20:58",
      updated_at: "2026-10-16 15:30:00",
    });

    render(
      <MemoryRouter>
        <TeamDetailPage onClose={vi.fn()} team={team} />
      </MemoryRouter>
    );

    const dialog = await screen.findByRole("dialog", { name: "チーム詳細" });
    expect(within(dialog).getByText("10/16 21:20")).toBeInTheDocument();
    expect(within(dialog).getByText("10/17 00:30")).toBeInTheDocument();
  });
});
