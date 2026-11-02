import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { NotificationPushDeliveryApi } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  adminNotificationDetailFixture,
  cloneFixture,
  notificationPushDeliveryDetailFixture,
  notificationScheduleDetailFixture,
  notificationScheduleResultsFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { NotificationDetailPage } from "~/features/notifications/pages/NotificationDetailPage";
import { ApiClientError } from "~/lib/api-client-error";

afterEach(cleanup);

function createApis(overrides?: {
  getDetail?: AdminNotificationQueryApi["getDetail"];
  getDelivery?: NotificationPushDeliveryApi["getDetail"];
  getResults?: NotificationScheduleQueryApi["getResults"];
  getSchedule?: NotificationScheduleQueryApi["getDetail"];
}) {
  const queryApi: AdminNotificationQueryApi = {
    list: vi.fn(),
    getDetail:
      overrides?.getDetail ??
      vi.fn().mockResolvedValue(cloneFixture(adminNotificationDetailFixture)),
  };
  const scheduleQueryApi: NotificationScheduleQueryApi = {
    list: vi.fn(),
    getDetail:
      overrides?.getSchedule ??
      vi
        .fn()
        .mockResolvedValue(cloneFixture(notificationScheduleDetailFixture)),
    getResults:
      overrides?.getResults ??
      vi
        .fn()
        .mockResolvedValue(cloneFixture(notificationScheduleResultsFixture)),
  };
  const pushDeliveryApi: NotificationPushDeliveryApi = {
    getDetail:
      overrides?.getDelivery ??
      vi
        .fn()
        .mockResolvedValue(cloneFixture(notificationPushDeliveryDetailFixture)),
  };
  return { pushDeliveryApi, queryApi, scheduleQueryApi };
}

function renderPage(apis = createApis()) {
  const result = render(
    <MemoryRouter>
      <NotificationDetailPage notificationId={103} {...apis} />
    </MemoryRouter>
  );
  return { ...apis, ...result };
}

describe("NotificationDetailPage", () => {
  it("対象者が未確定のときはユーザー単位の集計を未確定と表示する", async () => {
    const notification = cloneFixture(adminNotificationDetailFixture);
    notification.schedules[0].audience.recipientResolution.status = "pending";
    renderPage(
      createApis({ getDetail: vi.fn().mockResolvedValue(notification) })
    );
    const card = (
      await screen.findByRole("heading", { name: "配信サマリー" })
    ).closest("section")!;
    expect(within(card).getAllByText("未確定")).toHaveLength(4);
  });

  it("概要に選択した配信回のサマリーを表示し、切り替え中は古い送信先集計を表示しない", async () => {
    const user = userEvent.setup();
    let resolveNext!: (value: typeof notificationScheduleDetailFixture) => void;
    const next = new Promise<typeof notificationScheduleDetailFixture>(
      (resolve) => {
        resolveNext = resolve;
      }
    );
    const first = {
      ...cloneFixture(notificationScheduleDetailFixture),
      notificationScheduleId: 504,
      deliveryProgress: {
        ...notificationScheduleDetailFixture.deliveryProgress,
        totalCount: 42,
      },
    };
    const second = {
      ...cloneFixture(notificationScheduleDetailFixture),
      notificationScheduleId: 506,
      deliveryProgress: {
        ...notificationScheduleDetailFixture.deliveryProgress,
        totalCount: 99,
      },
    };
    const getSchedule = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockReturnValueOnce(next);
    const apis = createApis({ getSchedule });
    renderPage(apis);
    const heading = await screen.findByRole("heading", {
      name: "配信サマリー",
    });
    const card = heading.closest("section")!;
    expect(await within(card).findByText("42")).toBeInTheDocument();
    expect(within(card).getByText("Push 未成功ユーザー")).toBeInTheDocument();
    expect(within(card).getByText("送信先なしユーザー")).toBeInTheDocument();
    expect(within(card).getByText("再送待ち")).toBeInTheDocument();
    expect(getSchedule).toHaveBeenCalledTimes(1);
    expect(apis.queryApi.getDetail).toHaveBeenCalledTimes(1);
    expect(apis.scheduleQueryApi.getResults).not.toHaveBeenCalled();

    await user.click(
      within(screen.getByRole("complementary")).getByRole("button", {
        name: /2回目/,
      })
    );
    expect(within(card).queryByText("42")).not.toBeInTheDocument();
    expect(
      within(card).getByText("送信先の集計を読み込み中です")
    ).toBeInTheDocument();
    await act(async () => {
      resolveNext(second);
      await next;
    });
    expect(await within(card).findByText("99")).toBeInTheDocument();
    expect(getSchedule).toHaveBeenCalledTimes(2);
    expect(apis.queryApi.getDetail).toHaveBeenCalledTimes(1);
    expect(apis.scheduleQueryApi.getResults).not.toHaveBeenCalled();
  });

  it("全タブで共通情報を表示し、配信回に応じた情報を切り替える", async () => {
    const user = userEvent.setup();
    const detail = cloneFixture(adminNotificationDetailFixture);
    detail.schedules[1].audience.items = [{ type: "all" }];
    const getSchedule = vi.fn(async (id: number) => ({
      ...cloneFixture(notificationScheduleDetailFixture),
      notificationScheduleId: id,
      audienceProgress: {
        totalCount: id === 504 ? 4 : 9,
        resolvedCount: id === 504 ? 4 : 7,
      },
    }));
    renderPage(
      createApis({ getDetail: vi.fn().mockResolvedValue(detail), getSchedule })
    );

    const sidebar = await screen.findByRole("complementary");
    expect(within(sidebar).getByText("配信履歴")).toBeInTheDocument();
    expect(within(sidebar).getByText("配信結果")).toBeInTheDocument();
    expect(within(sidebar).getByText("対象指定")).toBeInTheDocument();
    expect(within(sidebar).getByText("通知情報")).toBeInTheDocument();
    expect(await within(sidebar).findByText("4 / 4")).toBeInTheDocument();

    await user.click(within(sidebar).getByRole("button", { name: /2回目/ }));
    expect(within(sidebar).getAllByText("全員").length).toBeGreaterThan(0);
    expect(await within(sidebar).findByText("7 / 9")).toBeInTheDocument();
    expect(within(sidebar).getByText("#103")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "配信状況" }));
    expect(
      within(screen.getByRole("complementary")).getByText("7 / 9")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "対象者・配信結果" }));
    expect(
      within(screen.getByRole("complementary")).getByText("7 / 9")
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("complementary")).getByText("#103")
    ).toBeInTheDocument();
  });

  it("通知内容と複数Scheduleを表示し、Recipient集計をDeliveryから分離する", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "競技開始時間変更のお知らせ",
      })
    ).toBeInTheDocument();
    const contentCard = screen
      .getByRole("heading", { name: "通知内容" })
      .closest("section");
    expect(contentCard).not.toBeNull();
    const titleLabel = within(contentCard!).getByText("通知タイトル");
    const detailLabel = within(contentCard!).getByText("通知詳細");
    expect(titleLabel.parentElement).toHaveTextContent(
      adminNotificationDetailFixture.content.detail.title
    );
    expect(detailLabel.parentElement).toHaveTextContent(
      adminNotificationDetailFixture.content.detail.body
    );
    expect(
      titleLabel.compareDocumentPosition(detailLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: "配信回を変更" }));
    const schedules = screen.getAllByRole("option");
    expect(schedules).toHaveLength(2);
    expect(screen.getByText(/対象者単位/)).toBeInTheDocument();
    expect(screen.getByText("対象")).toBeInTheDocument();
    await user.click(schedules[1]);
    expect(
      screen.getByText("配信元削除", { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText("停止者: システム", { exact: false })
    ).toBeInTheDocument();
  });

  it("Scheduleの6種類の状態と手動停止者を表示する", async () => {
    const detail = cloneFixture(adminNotificationDetailFixture);
    const baseSchedule = detail.schedules[0];
    const statuses = [
      ["scheduled", "配信予定"],
      ["resolving", "対象解決中"],
      ["sending", "送信中"],
      ["completed", "完了"],
      ["failed", "失敗"],
      ["stopped", "停止済み"],
    ] as const;
    detail.schedules = statuses.map(([status], index) => ({
      ...baseSchedule,
      notificationScheduleId: 600 + index,
      status,
      stop:
        status === "stopped"
          ? {
              reason: "manual",
              stoppedAt: "2026-11-07T04:00:00.000Z",
              stoppedBy: { userId: 456, userName: "HAL 花子" },
            }
          : null,
    }));
    const user = userEvent.setup();
    renderPage(createApis({ getDetail: vi.fn().mockResolvedValue(detail) }));

    await screen.findByText("Pushタイトル");
    for (let index = 0; index < statuses.length; index++) {
      await user.click(screen.getByRole("combobox", { name: "配信回を変更" }));
      await user.click(screen.getAllByRole("option")[index]);
      const labels = [
        "配信待ち",
        "対象者確定中",
        "送信中",
        "配信完了",
        "処理失敗",
        "停止",
      ];
      expect(screen.getAllByText(labels[index]).length).toBeGreaterThan(0);
    }

    expect(
      screen.getByText("停止者: HAL 花子", { exact: false })
    ).toBeInTheDocument();
  });

  it("削除済みの予約者・手動停止者をシステム操作と断定しない", async () => {
    const detail = cloneFixture(adminNotificationDetailFixture);
    detail.schedules[0].scheduledBy = null;
    detail.schedules[0].stop = {
      reason: "manual",
      stoppedAt: "2026-11-07T04:00:00.000Z",
      stoppedBy: null,
    };
    renderPage(createApis({ getDetail: vi.fn().mockResolvedValue(detail) }));

    expect(
      await screen.findByText("不明（削除済みの可能性あり）")
    ).toBeInTheDocument();
    expect(
      screen.getByText("停止者: 削除済みユーザー", { exact: false })
    ).toBeInTheDocument();
  });

  it("Resultsをタブを開いた時だけ取得し、Delivery詳細を必要時だけ表示する", async () => {
    const user = userEvent.setup();
    const getResults = vi
      .fn()
      .mockResolvedValue(cloneFixture(notificationScheduleResultsFixture));
    const getDelivery = vi
      .fn()
      .mockResolvedValue(cloneFixture(notificationPushDeliveryDetailFixture));
    renderPage(createApis({ getDelivery, getResults }));

    await screen.findByText("Pushタイトル");
    expect(getResults).not.toHaveBeenCalled();
    expect(getDelivery).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "対象者・配信結果" }));
    expect(await screen.findByText("山田 太郎")).toBeInTheDocument();
    expect(getResults).toHaveBeenCalledWith(504, { page: 1, limit: 50 });
    expect(screen.getAllByText("送信先なし").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("searchbox", { name: "対象者を検索" })
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: "送信結果で絞り込み" })
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: "対象指定で絞り込み" })
    ).toBeDisabled();
    expect(
      screen.getByText("検索・絞り込みは今後対応予定です。")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "山田 太郎の送信先" }));
    expect(
      screen.getByRole("row", { name: /^Android.*FCM受付成功/ })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delivery #9012の詳細" })
    );
    expect(
      await screen.findByRole("dialog", { name: "Push配送詳細" })
    ).toBeInTheDocument();
    expect(getDelivery).toHaveBeenCalledWith(9012);
    expect(screen.getByText("UNAVAILABLE")).toBeInTheDocument();
  });

  it("Resultsの部分取得失敗でも通知本体を残して再試行できる", async () => {
    const user = userEvent.setup();
    const getResults = vi
      .fn()
      .mockRejectedValueOnce(new Error("results error"))
      .mockResolvedValueOnce(cloneFixture(notificationScheduleResultsFixture));
    renderPage(createApis({ getResults }));

    await screen.findByText("Pushタイトル");
    await user.click(screen.getByRole("button", { name: "対象者・配信結果" }));
    expect(
      await screen.findByText("配信結果を読み込めませんでした。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "競技開始時間変更のお知らせ" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再試行" }));
    expect(await screen.findByText("山田 太郎")).toBeInTheDocument();
  });

  it("Scheduleが404でも通知本体を残して再試行できる", async () => {
    const user = userEvent.setup();
    const getSchedule = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(
          404,
          "Scheduleが見つかりません。",
          "NOTIFICATION_SCHEDULE_NOT_FOUND"
        )
      )
      .mockResolvedValueOnce(cloneFixture(notificationScheduleDetailFixture));
    renderPage(createApis({ getSchedule }));

    await screen.findByText("Pushタイトル");
    await user.click(screen.getByRole("button", { name: "配信状況" }));
    expect(
      await screen.findByText("Scheduleが見つかりません。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "競技開始時間変更のお知らせ" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再試行" }));
    expect(await screen.findByText("処理状況")).toBeInTheDocument();
    expect(getSchedule).toHaveBeenCalledTimes(2);
  });

  it("Push配送詳細404を表示し、モーダル内で再試行できる", async () => {
    const user = userEvent.setup();
    const getDelivery = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(
          404,
          "Push配送が見つかりません。",
          "NOTIFICATION_PUSH_DELIVERY_NOT_FOUND"
        )
      )
      .mockResolvedValueOnce(
        cloneFixture(notificationPushDeliveryDetailFixture)
      );
    renderPage(createApis({ getDelivery }));

    await screen.findByText("Pushタイトル");
    await user.click(screen.getByRole("button", { name: "対象者・配信結果" }));
    await screen.findByText("山田 太郎");
    await user.click(screen.getByRole("button", { name: "山田 太郎の送信先" }));
    await user.click(
      screen.getByRole("button", { name: "Delivery #9012の詳細" })
    );

    const dialog = await screen.findByRole("dialog", { name: "Push配送詳細" });
    expect(
      within(dialog).getByText("Push配送が見つかりません。")
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "再試行" }));
    expect(await within(dialog).findByText("UNAVAILABLE")).toBeInTheDocument();
    expect(getDelivery).toHaveBeenCalledTimes(2);
  });

  it("削除済みsourceと通知404を明確に表示する", async () => {
    const deletedSource = cloneFixture(adminNotificationDetailFixture);
    deletedSource.creation = {
      method: "automatic",
      source: { id: 51, label: null, type: "gathering" },
      user: null,
    };
    const { unmount } = renderPage(
      createApis({ getDetail: vi.fn().mockResolvedValue(deletedSource) })
    );
    expect(
      (await screen.findAllByText(/自動通知・削除済み/)).length
    ).toBeGreaterThan(0);
    unmount();

    renderPage(
      createApis({
        getDetail: vi
          .fn()
          .mockRejectedValue(
            new ApiClientError(
              404,
              "通知が見つかりません。",
              "ADMIN_NOTIFICATION_NOT_FOUND"
            )
          ),
      })
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "通知が見つかりません。"
      )
    );
  });
  it("Worker競合409後に再取得し、タブを維持して取消を非表示にする", async () => {
    const notification = cloneFixture(adminNotificationDetailFixture);
    notification.schedules = notification.schedules.map((schedule) => ({
      ...schedule,
      status: "scheduled",
    }));
    const updated = cloneFixture(notification);
    updated.schedules = updated.schedules.map((schedule) => ({
      ...schedule,
      status: "sending",
    }));
    const apis = createApis({
      getSchedule: vi.fn().mockResolvedValue({
        ...notificationScheduleDetailFixture,
        status: "scheduled",
      }),
      getDetail: vi
        .fn()
        .mockResolvedValueOnce(notification)
        .mockResolvedValue(updated),
    });
    const cancel = vi
      .fn()
      .mockRejectedValue(new ApiClientError(409, "配信が開始されました。"));
    const user = userEvent.setup();
    const reportFeedback = vi.fn();
    render(
      <MemoryRouter>
        <NotificationDetailPage
          notificationId={103}
          {...apis}
          commandApi={{ create: vi.fn(), patch: vi.fn(), delete: vi.fn() }}
          scheduleCommandApi={{ cancel, resend: vi.fn(), stop: vi.fn() }}
          reportFeedback={reportFeedback}
        />
      </MemoryRouter>
    );
    await screen.findByRole("button", { name: "配信予約をキャンセル" });
    await user.click(screen.getByRole("button", { name: "配信状況" }));
    await user.click(
      screen.getByRole("button", { name: "配信予約をキャンセル" })
    );
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/Schedule #/)).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "配信予約をキャンセル" })
    );
    await screen.findByText("配信が開始されました。");
    expect(apis.queryApi.getDetail).toHaveBeenCalledTimes(2);
    expect(
      screen.queryByRole("button", { name: "配信予約をキャンセル" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "配信状況" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(reportFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "action-error" })
    );
  });
  it.each(["automatic", "started"])(
    "%s通知の削除操作を表示しない",
    async (condition) => {
      const notification = cloneFixture(adminNotificationDetailFixture);
      notification.schedules = notification.schedules.map((schedule) => ({
        ...schedule,
        status: condition === "started" ? "sending" : "scheduled",
      }));
      if (condition === "automatic")
        notification.creation = {
          method: "automatic",
          user: null,
          source: { type: "gathering", id: 1, label: null },
        };
      const apis = createApis({
        getDetail: vi.fn().mockResolvedValue(notification),
      });
      render(
        <MemoryRouter>
          <NotificationDetailPage
            notificationId={103}
            {...apis}
            commandApi={{ create: vi.fn(), patch: vi.fn(), delete: vi.fn() }}
          />
        </MemoryRouter>
      );
      await screen.findByRole("heading", {
        name: notification.content.detail.title,
      });
      expect(
        screen.queryByRole("button", { name: "通知を削除" })
      ).not.toBeInTheDocument();
    }
  );
});
