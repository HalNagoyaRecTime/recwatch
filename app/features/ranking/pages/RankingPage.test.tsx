import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  useSearchParams,
} from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RankingApi } from "~/features/ranking/api";
import { RankingPage } from "~/features/ranking/pages/RankingPage";
import { TeamApi } from "~/features/team/api";
import { ApiClientError } from "~/lib/api-client-error";
import type { Ranking } from "~/features/ranking/model/ranking";

// jsdomは scrollIntoView を実装していないため、呼ばれた要素と引数を記録する
const scrollIntoView = vi.fn();
const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Element.prototype.scrollIntoView = originalScrollIntoView;
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
      screen.getByRole("button", { name: "すべての選択を解除" })
    ).toBeDisabled();
  });

  it("チームを選択すると件数と名前が表示され、一括入力を開始できる", async () => {
    const user = userEvent.setup();
    mockTeamApi();
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByLabelText("赤チームを選択"));

    expect(
      getSelectionSummary("選択中 2件（青チーム、赤チーム）")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );
    expect(
      await screen.findByRole("dialog", { name: "得点のまとめ入力" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("青チーム").length).toBeGreaterThan(0);
    expect(screen.getAllByText("赤チーム").length).toBeGreaterThan(0);
  });

  it("すべての選択を解除すると選択が空になる", async () => {
    const user = userEvent.setup();
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "すべての選択を解除" })
    );

    expect(
      screen.getByText("チームを選択すると、得点をまとめて入力できます。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    ).toBeDisabled();
  });

  it("ページを移動しても選択が残り、別ページのチームもまとめて入力の対象になる", async () => {
    const user = userEvent.setup();
    mockTeamApi();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "次のページ" }));

    expect(await screen.findByLabelText("緑チームを選択")).toBeInTheDocument();
    await user.click(screen.getByLabelText("緑チームを選択"));

    expect(
      getSelectionSummary("選択中 2件（青チーム、緑チーム）")
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );
    expect(
      await screen.findByLabelText("青チームの加算点")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("緑チームの加算点")).toBeInTheDocument();
  });

  it("まとめ入力を開くとき、別ページで選んだチームの最新の得点を取り直す", async () => {
    const user = userEvent.setup();
    // 青チーム（選択時100点）が、選択後に別の操作で150点になっている
    const getTeamById = mockTeamApi({ scores: { 1: 150 } });
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByLabelText("緑チームを選択");
    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );

    const dialog = await screen.findByRole("dialog", {
      name: "得点のまとめ入力",
    });
    expect(getTeamById).toHaveBeenCalledWith(1);
    const blueRow = within(dialog).getByText("青チーム").closest("tr")!;
    expect(within(blueRow).getAllByText("150pt")).toHaveLength(2);
  });

  it("削除されていたチームは、まとめ入力を開くときに選択から外す", async () => {
    const user = userEvent.setup();
    mockTeamApi({ deletedTeamIds: [2] });
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByLabelText("赤チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );

    const dialog = await screen.findByRole("dialog", {
      name: "得点のまとめ入力",
    });
    expect(
      within(dialog).queryByLabelText("赤チームの加算点")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("削除されたチーム（赤チーム）を選択から外しました。")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("赤チームを選択")).not.toBeChecked();
  });

  it("最新の得点を取得できなければ、まとめ入力を開かずエラーを表示する", async () => {
    const user = userEvent.setup();
    vi.spyOn(TeamApi, "getTeamById").mockRejectedValue(
      new ApiClientError(500, "error")
    );
    renderRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "まとめて得点を入力" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "最新の得点を取得できませんでした。"
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("青チームを選択")).toBeChecked();
  });

  it("選択が多いときはチーム名を途中まで表示し、残りは「ほか○件」でまとめる", async () => {
    const user = userEvent.setup();
    const manyRankings: Ranking[] = Array.from({ length: 10 }, (_, index) => ({
      rank: index + 1,
      teamId: 100 + index,
      teamName: `チーム${index + 1}`,
      score: 100 - index,
    }));
    render(
      <MemoryRouter initialEntries={["/ranking"]}>
        <RankingPage
          limit={10}
          offset={0}
          onRevalidate={vi.fn()}
          rankings={manyRankings}
          total={manyRankings.length}
        />
      </MemoryRouter>
    );

    for (const ranking of manyRankings) {
      await user.click(screen.getByLabelText(`${ranking.teamName}を選択`));
    }

    expect(
      screen.getByRole("button", { name: "チーム8の表示ページへ移動" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "チーム9の表示ページへ移動" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ほか2件" }));
    expect(
      screen.getByRole("button", { name: "チーム10の表示ページへ移動" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "折りたたむ" }));
    expect(
      screen.queryByRole("button", { name: "チーム10の表示ページへ移動" })
    ).not.toBeInTheDocument();
  });

  it("検索しても選択が残る", async () => {
    const user = userEvent.setup();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.type(
      screen.getByRole("searchbox", { name: "ランキングを検索" }),
      "緑"
    );

    expect(await screen.findByLabelText("緑チームを選択")).toBeInTheDocument();
    expect(screen.queryByLabelText("青チームを選択")).not.toBeInTheDocument();
    expect(getSelectionSummary("選択中 1件（青チーム）")).toBeInTheDocument();
  });

  it("選択中のチーム名を押すと、そのチームが載っているページへ移動する", async () => {
    const user = userEvent.setup();
    mockRankingListApi();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByLabelText("緑チームを選択");

    await user.click(
      screen.getByRole("button", { name: "青チームの表示ページへ移動" })
    );

    expect(await screen.findByLabelText("青チームを選択")).toBeChecked();
    expect(screen.queryByLabelText("緑チームを選択")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      })
    );
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(
      screen.getByLabelText("青チームを選択")
    );
  });

  it("表示中のチーム名を押すと、ページはそのままでそのチームを真ん中へスクロールする", async () => {
    const user = userEvent.setup();
    const getRankingList = mockRankingListApi();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("赤チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "赤チームの表示ページへ移動" })
    );

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(
      screen.getByLabelText("赤チームを選択")
    );
    expect(getRankingList).not.toHaveBeenCalled();
  });

  it("移動先のページにチームがいなくても、スクロール対象を残さない", async () => {
    const user = userEvent.setup();
    // 位置を調べたときは2ページ目にいたが、移動するまでに順位が変わった想定
    vi.spyOn(RankingApi, "getRankingList").mockResolvedValue({
      items: [allRankings[2], allRankings[1], allRankings[0]],
      limit: 100,
      offset: 0,
      total: allRankings.length,
    });
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));

    // 青チームは実際には1ページ目にいるので、2ページ目へ移動しても見つからない
    await user.click(
      screen.getByRole("button", { name: "青チームの表示ページへ移動" })
    );
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    scrollIntoView.mockClear();
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByLabelText("緑チームを選択");
    await user.click(screen.getByLabelText("緑チームを選択"));
    await user.click(
      screen.getByRole("button", { name: "青チームの表示ページへ移動" })
    );
    await waitFor(() =>
      expect(screen.getByLabelText("緑チームを選択")).toBeInTheDocument()
    );
    expect(scrollIntoView).not.toHaveBeenCalled();

    // そのあと青チームのページを開いても、勝手にスクロールしない
    await user.click(screen.getByRole("button", { name: "前のページ" }));
    await screen.findByLabelText("青チームを選択");
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("検索中に別のチーム名を押すと、検索を外してそのチームのページへ移動する", async () => {
    const user = userEvent.setup();
    mockRankingListApi();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    const searchBox = screen.getByRole("searchbox", {
      name: "ランキングを検索",
    });
    await user.type(searchBox, "緑");
    await screen.findByLabelText("緑チームを選択");

    await user.click(
      screen.getByRole("button", { name: "青チームの表示ページへ移動" })
    );

    expect(await screen.findByLabelText("青チームを選択")).toBeChecked();
    expect(searchBox).toHaveValue("");
  });

  it("すべての選択を解除すると、別ページの選択も外れる", async () => {
    const user = userEvent.setup();
    renderPagedRankingPage();

    await user.click(screen.getByLabelText("青チームを選択"));
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByLabelText("緑チームを選択");
    await user.click(
      screen.getByRole("button", { name: "すべての選択を解除" })
    );

    expect(
      screen.getByText("チームを選択すると、得点をまとめて入力できます。")
    ).toBeInTheDocument();
  });
});

const allRankings: readonly Ranking[] = [
  ...rankings,
  { rank: 3, teamId: 3, teamName: "緑チーム", score: 60 },
];

/** ルートのloaderと同じく、URLの検索条件・ページから表示する一覧を決める。 */
function PagedRankingPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const limit = 2;
  const filtered = allRankings.filter((ranking) =>
    ranking.teamName.includes(search)
  );
  return (
    <RankingPage
      limit={limit}
      offset={(page - 1) * limit}
      onRevalidate={vi.fn()}
      rankings={filtered.slice((page - 1) * limit, page * limit)}
      total={filtered.length}
    />
  );
}

function renderPagedRankingPage() {
  const router = createMemoryRouter(
    [{ path: "/ranking", element: <PagedRankingPage /> }],
    { initialEntries: ["/ranking"] }
  );
  return render(<RouterProvider router={router} />);
}

/** 選択中の表示は、チーム名がボタンに分かれているため段落全体の文字で探す。 */
function getSelectionSummary(text: string) {
  return screen.getByText(
    (_, element) => element?.tagName === "P" && element.textContent === text
  );
}

function mockRankingListApi() {
  return vi
    .spyOn(RankingApi, "getRankingList")
    .mockImplementation(async ({ limit, offset }) => ({
      items: allRankings.slice(offset, offset + limit),
      limit,
      offset,
      total: allRankings.length,
    }));
}

/** チーム取得APIを、表示用のデータから最新の得点を返すように差し替える。 */
function mockTeamApi({
  deletedTeamIds = [],
  scores = {},
}: {
  deletedTeamIds?: readonly number[];
  scores?: Record<number, number>;
} = {}) {
  return vi.spyOn(TeamApi, "getTeamById").mockImplementation(async (teamId) => {
    const ranking = allRankings.find((item) => item.teamId === teamId);
    if (!ranking || deletedTeamIds.includes(teamId)) {
      throw new ApiClientError(404, "not found");
    }
    return {
      id: ranking.teamId,
      name: ranking.teamName,
      registeredAt: "2026-10-01T09:00:00+09:00",
      registeredClasses: [],
      score: scores[teamId] ?? ranking.score,
      updatedAt: "2026-10-01T09:00:00+09:00",
    };
  });
}
