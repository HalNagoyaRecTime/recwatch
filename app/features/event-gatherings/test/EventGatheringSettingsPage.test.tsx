import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { EventGatheringSettingsPage } from "~/features/event-gatherings/pages/EventGatheringSettingsPage";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderPage(path: string, load = vi.fn(), save = vi.fn()) {
  const memberGateway = {
    loadCandidates: vi.fn().mockResolvedValue({
      classrooms: [{ id: 1, name: "HAL1A" }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map(),
    }),
    loadMembers: vi.fn().mockResolvedValue([]),
    saveMembers: vi.fn().mockResolvedValue([1001]),
  };

  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          element={
            <EventGatheringSettingsPage
              memberGateway={memberGateway}
              settingsGateway={{ load, save }}
              spotGateway={{
                list: vi.fn().mockResolvedValue({
                  items: [
                    { id: 1, name: "出入口①", createdAt: "", updatedAt: "" },
                  ],
                  total: 1,
                  limit: 1,
                  offset: 0,
                }),
                getById: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
              }}
            />
          }
          path="/events/:eventId/gatherings"
        />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
  return { memberGateway };
}

/** イベント詳細の子ルートとして開き、詳細の再読み込みを受け取れる状態で描画する。 */
function renderPageInEventDetail(reload: () => void) {
  const settings = {
    eventId: 7,
    rounds: [
      {
        round: 1,
        gatherings: [
          {
            id: 101,
            time: "10:45",
            spot: { id: 1, name: "出入口①" },
            memberCount: 0,
          },
        ],
      },
    ],
  };
  const memberGateway = {
    loadCandidates: vi.fn().mockResolvedValue({
      classrooms: [{ id: 1, code: "HAL1A", name: "1年Aクラス" }],
      students: [
        {
          id: 10,
          userId: 1001,
          name: "山田 太郎",
          classroomId: 1,
          attendanceNumber: 1,
          studentNumber: "2026001",
          isLiveActive: true,
        },
      ],
      nonStudents: new Map(),
    }),
    loadMembers: vi.fn().mockResolvedValue([]),
    saveMembers: vi.fn().mockResolvedValue([1001]),
  };

  render(
    <MemoryRouter initialEntries={["/events/7/gatherings"]}>
      <Routes>
        <Route
          element={<Outlet context={{ reload }} />}
          path="/events/:eventId"
        >
          <Route
            element={
              <EventGatheringSettingsPage
                memberGateway={memberGateway}
                settingsGateway={{
                  load: vi.fn().mockResolvedValue(settings),
                  save: vi.fn(),
                }}
                spotGateway={{
                  list: vi.fn().mockResolvedValue({
                    items: [
                      { id: 1, name: "出入口①", createdAt: "", updatedAt: "" },
                    ],
                    total: 1,
                    limit: 1,
                    offset: 0,
                  }),
                  getById: vi.fn(),
                  create: vi.fn(),
                  update: vi.fn(),
                  delete: vi.fn(),
                }}
              />
            }
            path="gatherings"
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  return { memberGateway };
}

describe("EventGatheringSettingsPage", () => {
  it("新しい集合と参加者を保存した後、完了画面からイベント詳細へ戻る", async () => {
    const load = vi.fn().mockResolvedValue({ eventId: 7, rounds: [] });
    const save = vi.fn().mockResolvedValue({
      eventId: 7,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 0,
            },
          ],
        },
      ],
    });
    const user = userEvent.setup();
    const { memberGateway } = renderPage("/events/7/gatherings", load, save);

    expect(
      screen.getByRole("heading", { name: "集合設定", level: 2 })
    ).toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalledWith(7));

    await user.click(
      await screen.findByRole("button", { name: "Roundを追加" })
    );
    const round = screen.getByRole("region", { name: "Round 1" });
    await user.click(
      within(round).getByRole("button", { name: "メンバーを選択" })
    );
    await user.click(await screen.findByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "選択を確定" }));
    expect(screen.getByText("1人選択中")).toBeInTheDocument();
    expect(memberGateway.saveMembers).not.toHaveBeenCalled();

    await user.type(within(round).getByLabelText("集合時間"), "10:45");
    await user.selectOptions(
      within(round).getByRole("combobox", { name: "集合場所" }),
      "1"
    );
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(7, {
        rounds: [
          {
            round: 1,
            startTime: null,
            gatherings: [{ gatheringId: null, time: "10:45", spotId: 1 }],
          },
        ],
      })
    );

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );

    expect(
      await screen.findByText("集合設定を保存しました")
    ).toBeInTheDocument();
    expect(
      screen.getByText("1Round・1件の集合を登録しました。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "集合設定" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一覧へ戻る" }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/7$/)
    );
    expect(
      screen.queryByRole("dialog", { name: "集合設定" })
    ).not.toBeInTheDocument();
  });

  it("既存集合の編集を保存すると、完了画面を表示してからモーダルを閉じる", async () => {
    const settings = {
      eventId: 7,
      rounds: [
        {
          round: 1,
          startTime: null,
          gatherings: [
            {
              id: 101,
              time: "10:45",
              spot: { id: 1, name: "出入口①" },
              memberCount: 0,
            },
          ],
        },
      ],
    };
    const load = vi.fn().mockResolvedValue(settings);
    const save = vi.fn().mockResolvedValue(settings);
    const user = userEvent.setup();
    renderPage("/events/7/gatherings", load, save);

    const startTime = await screen.findByLabelText("Round 1 の開始時刻");
    await user.type(startTime, "11:00");
    await user.click(screen.getByRole("button", { name: "集合設定を保存" }));

    expect(
      await screen.findByText("集合設定を保存しました")
    ).toBeInTheDocument();
    expect(
      screen.getByText("1Round・1件の集合を登録しました。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "集合設定" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一覧へ戻る" }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events\/7$/)
    );
    expect(
      screen.queryByRole("dialog", { name: "集合設定" })
    ).not.toBeInTheDocument();
  });

  it("参加者だけ保存してモーダルを閉じずにいても、イベント詳細を読み直す", async () => {
    const reload = vi.fn();
    const user = userEvent.setup();
    const { memberGateway } = renderPageInEventDetail(reload);

    await user.click(
      await screen.findByRole("button", { name: "メンバーを選択" })
    );
    await user.click(await screen.findByLabelText("山田 太郎を選択"));
    await user.click(screen.getByRole("button", { name: "参加者を保存" }));

    await waitFor(() =>
      expect(memberGateway.saveMembers).toHaveBeenCalledWith(101, [1001])
    );
    // 集合設定を保存していなくても、サーバーの人数が変わったので詳細を読み直す
    expect(reload).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("集合設定を保存しました。続けて参加者を設定できます。")
    ).not.toBeInTheDocument();
  });

  it("不正なイベント ID では読み込まずエラーを表示する", () => {
    const load = vi.fn();
    renderPage("/events/not-a-number/gatherings", load);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "イベントIDが不正です。"
    );
    expect(load).not.toHaveBeenCalled();
  });
});
