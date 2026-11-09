import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingPage } from "~/features/ranking/pages/RankingPage";
import type { Ranking } from "~/features/ranking/model/ranking";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rankings: readonly Ranking[] = [
  { rank: 1, teamId: 1, teamName: "青チーム", score: 100 },
  { rank: 2, teamId: 2, teamName: "赤チーム", score: 80 },
];

function renderRankingPage() {
  return render(
    <MemoryRouter initialEntries={["/ranking"]}>
      <RankingPage
        limit={10}
        offset={0}
        onRevalidate={vi.fn()}
        rankings={rankings}
        total={2}
      />
    </MemoryRouter>
  );
}

describe("RankingPage", () => {
  it("未選択時は一括入力・一括解除を開始できない", () => {
    renderRankingPage();

    expect(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "表示中の選択を解除" })
    ).toBeDisabled();
  });

  it("チームを選択すると件数と名前が表示され、一括入力を開始できる", async () => {
    const user = userEvent.setup();
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByLabelText("赤チームを選択"));

    expect(
      screen.getByText("選択中 2件（青チーム、赤チーム）")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );
    expect(
      screen.getByRole("dialog", { name: "得点のまとめ入力" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("青チーム").length).toBeGreaterThan(0);
    expect(screen.getAllByText("赤チーム").length).toBeGreaterThan(0);
  });

  it("表示中の選択を解除すると選択が空になる", async () => {
    const user = userEvent.setup();
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "表示中の選択を解除" })
    );

    expect(
      screen.getByText("チームを選択すると、得点をまとめて入力できます。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    ).toBeDisabled();
  });
});
