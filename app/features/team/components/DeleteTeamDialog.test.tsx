import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeleteTeamDialog } from "~/features/team/components/DeleteTeamDialog";
import type { Team } from "~/features/team/model/team";

const team: Team = {
  id: 3,
  name: "赤組",
  registeredClasses: ["1A", "1B"],
  score: 0,
  registeredAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};

function renderDialog(overrides: Partial<Team> = {}) {
  render(
    <DeleteTeamDialog
      isSubmitting={false}
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      team={{ ...team, ...overrides }}
    />
  );
}

describe("DeleteTeamDialog", () => {
  it("登録クラスがクラスごとの新しいチームへ戻ることを説明する", () => {
    renderDialog();

    const description = screen.getByRole("alertdialog");
    expect(description).toHaveTextContent("「赤組」を削除します。");
    expect(description).toHaveTextContent(
      "登録クラス（1A・1B）は、クラスごとの新しいチームに戻ります。"
    );
    expect(description).not.toHaveTextContent("一覧から見えなくなります");
    expect(screen.getByRole("button", { name: "削除する" })).toBeEnabled();
  });

  it("得点があるチームは削除を確定できない", () => {
    renderDialog({ score: 10 });

    expect(screen.getByRole("button", { name: "削除する" })).toBeDisabled();
  });
});
