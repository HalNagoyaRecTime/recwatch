import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
      screen.getByRole("dialog", { name: "得点のまとめ入力" })
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
    expect(screen.getByLabelText("青チームの加算点")).toBeInTheDocument();
    expect(screen.getByLabelText("緑チームの加算点")).toBeInTheDocument();
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
