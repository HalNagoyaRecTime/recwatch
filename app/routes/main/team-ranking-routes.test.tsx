import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingApi } from "~/features/ranking/api";
import { TeamApi } from "~/features/team/api";
import type { Team } from "~/features/team/model/team";
import { ApiClientError } from "~/lib/api-client-error";
import { managementRouteIds } from "~/routes/main/management-route-ids";
import RankingEditRoute, {
  clientLoader as rankingEditLoader,
  ErrorBoundary as RankingEditErrorBoundary,
} from "~/routes/main/ranking.$teamId.edit";
import RankingRoute, {
  clientLoader as rankingLoader,
} from "~/routes/main/ranking";
import TeamDetailRoute, {
  clientLoader as teamDetailLoader,
  ErrorBoundary as TeamDetailErrorBoundary,
} from "~/routes/main/teams.$id";
import TeamEditRoute, {
  clientLoader as teamEditLoader,
  ErrorBoundary as TeamEditErrorBoundary,
} from "~/routes/main/teams.$id.edit";
import TeamCreateRoute from "~/routes/main/teams.new";
import TeamsRoute, { clientLoader as teamsLoader } from "~/routes/main/teams";

// 全体実行で負荷が高いと初回描画が1秒を超えるため、最初の待機だけ長めにする
const initialRender = { timeout: 3000 };

const mocks = vi.hoisted(() => ({
  getClassRoomData: vi.fn(),
}));

vi.mock("~/features/classRoom/application/class-room-options", () => ({
  getClassRoomData: mocks.getClassRoomData,
}));

const classRoom = {
  classRoomId: 1,
  classCode: "1A",
  className: "1年Aクラス",
  studentCount: 1,
  teacher: null,
};

const team: Team = {
  id: 3,
  name: "赤組",
  registeredClasses: ["1A"],
  score: 10,
  registeredAt: "2026-10-01T09:00:00+09:00",
  updatedAt: "2026-10-02T09:00:00+09:00",
};

function renderTeamRankingRouter(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        id: managementRouteIds.teams,
        path: "/teams",
        loader: ({ request }) => teamsLoader({ request }),
        element: <TeamsRoute />,
        children: [
          { path: "new", element: <TeamCreateRoute /> },
          {
            path: ":id",
            loader: ({ params }) => teamDetailLoader({ params }),
            element: <TeamDetailRoute />,
            errorElement: <TeamDetailErrorBoundary />,
          },
          {
            path: ":id/edit",
            loader: ({ params }) => teamEditLoader({ params }),
            element: <TeamEditRoute />,
            errorElement: <TeamEditErrorBoundary />,
          },
        ],
      },
      {
        id: managementRouteIds.ranking,
        path: "/ranking",
        loader: ({ request }) => rankingLoader({ request }),
        element: <RankingRoute />,
        children: [
          {
            path: ":teamId/edit",
            loader: ({ params }) => rankingEditLoader({ params }),
            element: <RankingEditRoute />,
            errorElement: <RankingEditErrorBoundary />,
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] }
  );

  render(<RouterProvider router={router} />);
  return router;
}

function mockTeamList(items: Team[] = [team]) {
  return vi.spyOn(TeamApi, "getTeamList").mockImplementation((query) =>
    Promise.resolve({
      items,
      limit: query.limit,
      offset: query.offset,
      total: 100,
    })
  );
}

function mockRankingList() {
  return vi.spyOn(RankingApi, "getRankingList").mockImplementation((query) =>
    Promise.resolve({
      items: [{ rank: 1, teamId: 3, teamName: "赤組", score: 10 }],
      limit: query.limit,
      offset: query.offset,
      total: 100,
    })
  );
}

async function closeErrorModal(
  router: ReturnType<typeof renderTeamRankingRouter>,
  listPath: string,
  listSearch: string,
  title: string,
  message: string
) {
  const user = userEvent.setup();
  expect(
    await screen.findByRole("alert", undefined, initialRender)
  ).toHaveTextContent(message);
  const dialog = screen.getByRole("dialog", { name: title });

  await user.click(
    within(dialog).getAllByRole("button", { name: "閉じる" })[0]
  );

  await waitFor(() => expect(router.state.location.pathname).toBe(listPath));
  expect(router.state.location.search).toBe(listSearch);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  mocks.getClassRoomData.mockReset();
});

describe("team management nested routes", () => {
  it("直接開いた新規登録Routeをキャンセルすると検索条件つき一覧へ戻る", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList();
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderTeamRankingRouter("/teams/new?search=keep&page=2");

    expect(
      await screen.findByLabelText("チーム名", undefined, initialRender)
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/teams"));

    expect(router.state.location.search).toBe("?search=keep&page=2");
    expect(getTeamList).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("新規登録の保存後は条件つき一覧へ戻り、一覧だけを再取得する", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList();
    const createTeam = vi.spyOn(TeamApi, "createTeam").mockResolvedValue(team);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderTeamRankingRouter("/teams/new?search=keep");

    await user.type(
      await screen.findByLabelText("チーム名", undefined, initialRender),
      "青組"
    );
    await user.click(
      within(screen.getByRole("listbox", { name: "クラス検索結果" })).getByRole(
        "button",
        { name: /1A/ }
      )
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/teams"));
    await waitFor(() => expect(getTeamList).toHaveBeenCalledTimes(2));
    expect(router.state.location.search).toBe("?search=keep");
    expect(createTeam).toHaveBeenCalledWith({
      teamName: "青組",
      classCodes: ["1A"],
    });
    // 登録クラス候補は一覧で一度だけ取得し、保存後の再取得には含めない
    expect(mocks.getClassRoomData).toHaveBeenCalledOnce();
  });

  it("編集Routeはチームだけを単体取得し、保存後は一覧だけを再取得する", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList();
    const getTeamById = vi
      .spyOn(TeamApi, "getTeamById")
      .mockResolvedValue(team);
    const updateTeam = vi.spyOn(TeamApi, "updateTeam").mockResolvedValue(team);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderTeamRankingRouter(
      "/teams/3/edit?search=keep&sortBy=teamName&sortOrder=asc"
    );

    expect(
      await screen.findByLabelText("チーム名", undefined, initialRender)
    ).toHaveValue("赤組");
    expect(getTeamById).toHaveBeenCalledOnce();
    expect(getTeamById).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/teams"));
    await waitFor(() => expect(getTeamList).toHaveBeenCalledTimes(2));

    expect(router.state.location.search).toBe(
      "?search=keep&sortBy=teamName&sortOrder=asc"
    );
    expect(updateTeam).toHaveBeenCalledWith(3, {
      teamName: "赤組",
      classCodes: ["1A"],
    });
    expect(getTeamById).toHaveBeenCalledOnce();
  });

  it("詳細Routeを閉じると一覧を再取得せずに検索条件つき一覧へ戻る", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList();
    vi.spyOn(TeamApi, "getTeamById").mockResolvedValue(team);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderTeamRankingRouter("/teams/3?search=keep");

    const dialog = await screen.findByRole(
      "dialog",
      { name: "チーム詳細" },
      initialRender
    );
    expect(within(dialog).getByText("10pt")).toBeInTheDocument();
    await user.click(
      within(dialog).getAllByRole("button", { name: "閉じる" }).at(-1)!
    );

    await waitFor(() => expect(router.state.location.pathname).toBe("/teams"));
    expect(router.state.location.search).toBe("?search=keep");
    expect(getTeamList).toHaveBeenCalledOnce();
  });

  it("チームの読み込み失敗は一覧を残したモーダルで表示し、条件を保って閉じられる", async () => {
    const getTeamList = mockTeamList();
    vi.spyOn(TeamApi, "getTeamById").mockRejectedValue(
      new ApiClientError(404, "team missing")
    );
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    const router = renderTeamRankingRouter("/teams/9/edit?search=keep&page=2");

    await closeErrorModal(
      router,
      "/teams",
      "?search=keep&page=2",
      "チーム情報を読み込めません",
      "エラー404:team missing"
    );
    expect(
      screen.getByRole("heading", { name: "チーム管理" })
    ).toBeInTheDocument();
    expect(getTeamList).toHaveBeenCalledOnce();
  });

  it("得点が0のチームを削除すると一覧を再取得する", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList([{ ...team, score: 0 }]);
    const deleteTeam = vi
      .spyOn(TeamApi, "deleteTeam")
      .mockResolvedValue(undefined);
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    renderTeamRankingRouter("/teams?search=keep");

    await user.click(
      await screen.findByRole("button", { name: "赤組の操作" }, initialRender)
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => expect(getTeamList).toHaveBeenCalledTimes(2));
    expect(deleteTeam).toHaveBeenCalledWith(3);
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    );
  });

  it("削除の直前に得点が入って409になったときは理由を表示する", async () => {
    const user = userEvent.setup();
    const getTeamList = mockTeamList([{ ...team, score: 0 }]);
    vi.spyOn(TeamApi, "deleteTeam").mockRejectedValue(
      new ApiClientError(
        409,
        "チームに得点が登録されているため削除できません",
        "TEAM_HAS_SCORES"
      )
    );
    mocks.getClassRoomData.mockResolvedValue([classRoom]);

    renderTeamRankingRouter("/teams");

    await user.click(
      await screen.findByRole("button", { name: "赤組の操作" }, initialRender)
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    const dialog = screen.getByRole("alertdialog");
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "チームに得点が登録されているため削除できません"
    );
    expect(getTeamList).toHaveBeenCalledOnce();
  });
});

describe("ranking nested routes", () => {
  it("得点編集の保存後は条件つきランキング一覧へ戻り、一覧だけを再取得する", async () => {
    const user = userEvent.setup();
    const getRankingList = mockRankingList();
    vi.spyOn(TeamApi, "getTeamById").mockResolvedValue(team);
    const addTeamScore = vi
      .spyOn(TeamApi, "addTeamScore")
      .mockResolvedValue({ ...team, score: 15 });

    const router = renderTeamRankingRouter("/ranking/3/edit?search=keep");

    await user.type(
      await screen.findByLabelText("加算する得点", undefined, initialRender),
      "5"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/ranking")
    );
    await waitFor(() => expect(getRankingList).toHaveBeenCalledTimes(2));
    expect(router.state.location.search).toBe("?search=keep");
    expect(addTeamScore).toHaveBeenCalledWith(3, { points: 5 });
  });

  it("得点情報の読み込み失敗は一覧を残したモーダルで表示し、条件を保って閉じられる", async () => {
    const getRankingList = mockRankingList();
    vi.spyOn(TeamApi, "getTeamById").mockRejectedValue(
      new ApiClientError(404, "team missing")
    );

    const router = renderTeamRankingRouter("/ranking/9/edit?search=keep");

    await closeErrorModal(
      router,
      "/ranking",
      "?search=keep",
      "得点情報を読み込めません",
      "エラー404:team missing"
    );
    expect(
      screen.getByRole("heading", { name: "ランキング管理" })
    ).toBeInTheDocument();
    expect(getRankingList).toHaveBeenCalledOnce();
  });
});
