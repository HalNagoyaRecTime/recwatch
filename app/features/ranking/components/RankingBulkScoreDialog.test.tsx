import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingBulkScoreDialog } from "~/features/ranking/components/RankingBulkScoreDialog";
import { TeamApi } from "~/features/team/api";
import type { Ranking } from "~/features/ranking/model/ranking";
import type { Team } from "~/features/team/model/team";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const blueTeam: Ranking = {
  rank: 1,
  teamId: 1,
  teamName: "青チーム",
  score: 100,
};
const redTeam: Ranking = {
  rank: 2,
  teamId: 2,
  teamName: "赤チーム",
  score: 80,
};

function createTeam(ranking: Ranking, score: number): Team {
  return {
    id: ranking.teamId,
    name: ranking.teamName,
    registeredClasses: [],
    score,
    registeredAt: "2026-10-01T09:00:00+09:00",
    updatedAt: "2026-10-01T09:00:00+09:00",
  };
}

describe("RankingBulkScoreDialog", () => {
  it("選択したチームの行と現在の得点を表示する", () => {
    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={vi.fn()}
        rankings={[blueTeam, redTeam]}
      />
    );

    const blueRow = screen.getByText("青チーム").closest("tr")!;
    const redRow = screen.getByText("赤チーム").closest("tr")!;
    // 加算点は未入力時0のため、現在の得点と更新後の得点が同じ表示になる
    expect(within(blueRow).getAllByText("100pt")).toHaveLength(2);
    expect(within(redRow).getAllByText("80pt")).toHaveLength(2);
  });

  it("加算点の入力に応じて更新後の得点をリアルタイムで反映する", async () => {
    const user = userEvent.setup();
    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={vi.fn()}
        rankings={[blueTeam]}
      />
    );

    const input = screen.getByLabelText("青チームの加算点");
    await user.clear(input);
    await user.type(input, "-30");

    expect(screen.getByText("70pt")).toBeInTheDocument();
  });

  it("未入力があると保存せずエラーを表示する", async () => {
    const user = userEvent.setup();
    const addTeamScore = vi.spyOn(TeamApi, "addTeamScore");
    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={vi.fn()}
        rankings={[blueTeam]}
      />
    );

    await user.clear(screen.getByLabelText("青チームの加算点"));
    await user.click(screen.getByRole("button", { name: "まとめて保存" }));

    expect(
      await screen.findByText("加算する得点はすべて整数で入力してください。")
    ).toBeInTheDocument();
    expect(addTeamScore).not.toHaveBeenCalled();
  });

  it("全チームの保存に成功すると件数つきの完了表示に切り替わる", async () => {
    const user = userEvent.setup();
    const addTeamScore = vi
      .spyOn(TeamApi, "addTeamScore")
      .mockImplementation((teamId, body) =>
        Promise.resolve(
          createTeam(
            teamId === blueTeam.teamId ? blueTeam : redTeam,
            (teamId === blueTeam.teamId ? blueTeam.score : redTeam.score) +
              body.points
          )
        )
      );
    const onSaved = vi.fn();

    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={onSaved}
        rankings={[blueTeam, redTeam]}
      />
    );

    await user.type(screen.getByLabelText("青チームの加算点"), "5");
    await user.type(screen.getByLabelText("赤チームの加算点"), "10");
    await user.click(screen.getByRole("button", { name: "まとめて保存" }));

    expect(
      await screen.findByText("2件の得点を更新しました。")
    ).toBeInTheDocument();
    expect(addTeamScore).toHaveBeenCalledWith(1, { points: 5 });
    expect(addTeamScore).toHaveBeenCalledWith(2, { points: 10 });
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith([1, 2]));
  });

  it("一部の保存が失敗すると、失敗したチームだけを残して再試行できる", async () => {
    const user = userEvent.setup();
    const addTeamScore = vi
      .spyOn(TeamApi, "addTeamScore")
      .mockImplementation((teamId, body) =>
        teamId === blueTeam.teamId
          ? Promise.reject(new Error("network error"))
          : Promise.resolve(createTeam(redTeam, redTeam.score + body.points))
      );
    // 加算が実際には反映されていないことを確認したうえで失敗とする
    vi.spyOn(TeamApi, "getTeamById").mockResolvedValue(
      createTeam(blueTeam, blueTeam.score)
    );
    const onSaved = vi.fn();

    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={onSaved}
        rankings={[blueTeam, redTeam]}
      />
    );

    const blueInput = screen.getByLabelText("青チームの加算点");
    await user.clear(blueInput);
    await user.type(blueInput, "5");
    await user.click(screen.getByRole("button", { name: "まとめて保存" }));

    expect(
      await screen.findByText(
        "青チームの更新に失敗しました。再度お試しください。"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("赤チーム")).not.toBeInTheDocument();
    expect(screen.getByText("青チーム")).toBeInTheDocument();
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith([2]));
    expect(addTeamScore).toHaveBeenCalledTimes(2);
  });

  it("通信エラーでも実際には加算済みなら成功として扱い、二重加算を防ぐ", async () => {
    const user = userEvent.setup();
    const addTeamScore = vi
      .spyOn(TeamApi, "addTeamScore")
      .mockImplementation((teamId, body) =>
        teamId === blueTeam.teamId
          ? Promise.reject(new Error("response lost"))
          : Promise.resolve(createTeam(redTeam, redTeam.score + body.points))
      );
    // レスポンスだけ失われており、サーバー側では加算が完了している
    const getTeamById = vi
      .spyOn(TeamApi, "getTeamById")
      .mockResolvedValue(createTeam(blueTeam, blueTeam.score + 5));
    const onSaved = vi.fn();

    render(
      <RankingBulkScoreDialog
        onClose={vi.fn()}
        onSaved={onSaved}
        rankings={[blueTeam, redTeam]}
      />
    );

    await user.type(screen.getByLabelText("青チームの加算点"), "5");
    await user.click(screen.getByRole("button", { name: "まとめて保存" }));

    expect(
      await screen.findByText("2件の得点を更新しました。")
    ).toBeInTheDocument();
    expect(getTeamById).toHaveBeenCalledWith(blueTeam.teamId);
    expect(addTeamScore).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith([2, 1]));
  });
});
