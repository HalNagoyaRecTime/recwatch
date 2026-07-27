import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import type { ManagedSchedule } from "../model/schedule";
import { ScheduleManagementPage } from "./ScheduleManagementPage";

const schedules: ManagedSchedule[] = [
  {
    id: "schedule-1",
    type: "opening",
    startTime: "08:30",
    endTime: "09:00",
    venueName: "コートA",
    gatheringSpotName: null,
    relatedEventName: null,
    notes: null,
    publication: { mode: "immediate" },
    notificationEnabled: false,
  },
  {
    id: "schedule-2",
    type: "competition",
    startTime: "09:10",
    endTime: "10:10",
    venueName: "コートB",
    gatheringSpotName: null,
    relatedEventName: "走れ！〇人〇脚！",
    notes: null,
    publication: { mode: "scheduled", publishAt: "09:00" },
    notificationEnabled: true,
  },
];

function createGateway(
  overrides: Partial<ScheduleManagementGateway> = {}
): ScheduleManagementGateway {
  return {
    list: vi.fn().mockResolvedValue(schedules),
    get: vi.fn().mockRejectedValue(new Error("Not used")),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderPage(
  gateway: ScheduleManagementGateway,
  state?: { feedbackMessage: string }
) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/schedule", state }]}>
      <ScheduleManagementPage gateway={gateway} />
    </MemoryRouter>
  );
}

describe("ScheduleManagementPage", () => {
  it("編集完了後のフィードバックを表示する", async () => {
    renderPage(createGateway(), {
      feedbackMessage: "スケジュールを更新しました。",
    });

    expect(
      screen.getByText("スケジュールを更新しました。")
    ).toBeInTheDocument();
    expect(await screen.findByText("走れ！〇人〇脚！")).toBeInTheDocument();
  });

  it("一覧を取得し、キーワードで絞り込む", async () => {
    const user = userEvent.setup();
    renderPage(createGateway());

    expect(await screen.findByText("走れ！〇人〇脚！")).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "スケジュールを検索" }),
      "開会式"
    );

    expect(screen.getByRole("button", { name: "開会式" })).toBeInTheDocument();
    expect(screen.queryByText("走れ！〇人〇脚！")).not.toBeInTheDocument();
  });

  it("選択したスケジュールの詳細を表示する", async () => {
    const user = userEvent.setup();
    renderPage(createGateway());

    const typeButton = await screen.findByRole("button", { name: "開会式" });
    await user.click(typeButton);

    const dialog = screen.getByRole("dialog", { name: "スケジュール詳細" });
    expect(within(dialog).getByText("08:30〜09:00")).toBeInTheDocument();
    expect(within(dialog).getByText("コートA")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "編集する" })
    ).toHaveAttribute("href", "/schedule/schedule-1/edit");
  });

  it("削除成功後に該当行を一覧から取り除く", async () => {
    const deleteSchedule = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage(createGateway({ delete: deleteSchedule }));

    const actionButton = await screen.findByRole("button", {
      name: "08:30のスケジュール操作",
    });

    await user.click(actionButton);
    await user.click(screen.getByRole("menuitem", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() =>
      expect(deleteSchedule).toHaveBeenCalledWith("schedule-1")
    );
    expect(
      screen.queryByRole("button", { name: "開会式" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("スケジュールを削除しました。")
    ).toBeInTheDocument();
  });

  it("削除に失敗した場合は行を残してエラーを表示する", async () => {
    const deleteSchedule = vi
      .fn()
      .mockRejectedValue(new Error("Request failed"));
    const user = userEvent.setup();
    renderPage(createGateway({ delete: deleteSchedule }));

    const actionButton = await screen.findByRole("button", {
      name: "08:30のスケジュール操作",
    });
    await user.click(actionButton);
    await user.click(screen.getByRole("menuitem", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText(
        "スケジュールを削除できませんでした。最新の状態を確認して再度お試しください。"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "開会式" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除する" })).toBeEnabled();
  });

  it("一覧取得に失敗した場合は再読み込みできるエラーを表示する", async () => {
    const list = vi.fn().mockRejectedValue(new Error("Request failed"));
    renderPage(createGateway({ list }));

    expect(
      await screen.findByText(
        "スケジュールを取得できませんでした。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "再読み込み" })
    ).toBeInTheDocument();
  });
});
