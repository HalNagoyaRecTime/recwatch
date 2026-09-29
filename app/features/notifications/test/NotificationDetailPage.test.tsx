import {
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
  it("通知内容と複数Scheduleを表示し、Recipient集計をDeliveryから分離する", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "競技開始時間変更のお知らせ",
      })
    ).toBeInTheDocument();
    const schedules = screen.getAllByRole("button", { name: /回目/ });
    expect(schedules).toHaveLength(2);
    expect(
      screen.getByText("Recipient単位。Push配送数とは別の集計です")
    ).toBeInTheDocument();
    expect(screen.getByText("対象Recipient")).toBeInTheDocument();
    await userEvent.setup().click(schedules[1]);
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
              stoppedAt: "2026-11-07T13:00:00+09:00",
              stoppedBy: { userId: 456, userName: "HAL 花子" },
            }
          : null,
    }));
    const user = userEvent.setup();
    renderPage(createApis({ getDetail: vi.fn().mockResolvedValue(detail) }));

    await screen.findByText("Pushタイトル");
    const scheduleButtons = screen.getAllByRole("button", { name: /回目/ });
    statuses.forEach(([, label], index) => {
      expect(scheduleButtons[index]).toHaveTextContent(label);
    });

    await user.click(scheduleButtons[5]);
    expect(
      screen.getByText("停止者: HAL 花子", { exact: false })
    ).toBeInTheDocument();
  });

  it("削除済みの予約者・手動停止者をシステム操作と断定しない", async () => {
    const detail = cloneFixture(adminNotificationDetailFixture);
    detail.schedules[0].scheduledBy = null;
    detail.schedules[0].stop = {
      reason: "manual",
      stoppedAt: "2026-11-07T13:00:00+09:00",
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
    expect(screen.getByText("Tokenなし")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delivery #9012の詳細" })
    );
    expect(
      await screen.findByRole("dialog", { name: "Push配送詳細" })
    ).toBeInTheDocument();
    expect(getDelivery).toHaveBeenCalledWith(9012);
    expect(screen.getByText("UNAVAILABLE")).toBeInTheDocument();
    expect(screen.getByText(/Android・FCM受付成功/)).toBeInTheDocument();
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
});
