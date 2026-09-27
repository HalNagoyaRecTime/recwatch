import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  AdminNotificationListResponse,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import { toNotificationMonthRange } from "~/features/notifications/hooks/notification-calendar-range";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  cloneFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { mockAdminNotificationQueryApi } from "~/features/notifications/mock/admin-notification-query-api";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";

afterEach(cleanup);

function createCommandApi(): AdminNotificationCommandApi {
  return {
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

function createQueryApi(
  list: AdminNotificationQueryApi["list"] = vi
    .fn()
    .mockResolvedValue(adminNotificationListFixture)
): AdminNotificationQueryApi {
  return {
    list,
    getDetail: vi.fn().mockResolvedValue(adminNotificationDetailFixture),
  };
}

function renderPage(
  queryApi: AdminNotificationQueryApi,
  initialCalendarMonth = new Date(2026, 10, 1)
) {
  return render(
    <MemoryRouter>
      <NotificationListPage
        commandApi={createCommandApi()}
        initialCalendarMonth={initialCalendarMonth}
        queryApi={queryApi}
      />
    </MemoryRouter>
  );
}

describe("NotificationListPage", () => {
  it("v2の6状態と作成方法を表示し、自動・手動を絞り込む", async () => {
    const user = userEvent.setup();
    renderPage(createQueryApi());

    expect(await screen.findByText("通知101")).toBeInTheDocument();
    for (const status of [
      "配信予定",
      "対象解決中",
      "送信中",
      "配信処理完了",
      "配信失敗",
      "停止済み",
    ]) {
      expect(screen.getByText(status)).toBeInTheDocument();
    }

    await user.click(screen.getByRole("combobox", { name: "通知の作成方法" }));
    await user.click(screen.getByRole("option", { name: "自動通知" }));

    expect(screen.getByText("通知102")).toBeInTheDocument();
    expect(screen.getByText("通知106")).toBeInTheDocument();
    expect(screen.getAllByText("削除済み").length).toBeGreaterThan(0);
    expect(screen.queryByText("通知101")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "通知の作成方法" }));
    await user.click(screen.getByRole("option", { name: "手動通知" }));
    expect(screen.getByText("通知101")).toBeInTheDocument();
    expect(screen.queryByText("通知102")).not.toBeInTheDocument();
  });

  it("グリッド表示でもv2一覧Responseを利用する", async () => {
    const user = userEvent.setup();
    renderPage(createQueryApi());
    await screen.findByText("通知101");

    await user.click(screen.getByRole("button", { name: "グリッド表示" }));

    expect(screen.getByLabelText("通知グリッド")).toBeInTheDocument();
    expect(screen.getAllByText("Schedule")).toHaveLength(6);
    expect(screen.getByText("2件")).toBeInTheDocument();
  });

  it("20件単位でページを切り替える", async () => {
    const items = Array.from({ length: 21 }, (_, index) => {
      const item = cloneFixture(adminNotificationListFixture.items[0]);
      item.notificationId = 101 + index;
      item.content.push.title = `通知${101 + index}`;
      return item;
    });
    const user = userEvent.setup();
    renderPage(createQueryApi(vi.fn().mockResolvedValue({ items })));

    expect(await screen.findByText("通知101")).toBeInTheDocument();
    expect(screen.queryByText("通知121")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    expect(screen.getByText("通知121")).toBeInTheDocument();
    expect(screen.queryByText("通知101")).not.toBeInTheDocument();
  });

  it("月範囲を1回取得し、複数Scheduleを日付ごとに詳細リンクとして配置する", async () => {
    const list = vi.fn((query) => mockAdminNotificationQueryApi.list(query));
    const user = userEvent.setup();
    const month = new Date(2026, 10, 1);
    renderPage(createQueryApi(list), month);
    await screen.findByText("通知101");

    await user.click(screen.getByRole("button", { name: "カレンダー表示" }));

    expect(
      await screen.findByLabelText("2026年11月の通知カレンダー")
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(list).toHaveBeenCalledWith(toNotificationMonthRange(month))
    );
    const notificationLinks = screen.getAllByRole("link", {
      name: /通知101の詳細を表示/,
    });
    expect(notificationLinks).toHaveLength(2);
    expect(notificationLinks[0]).toHaveAttribute("href", "/notifications/101");
    expect(screen.getByLabelText("11月7日")).toContainElement(
      notificationLinks[0]
    );
    expect(screen.getByLabelText("11月8日")).toContainElement(
      notificationLinks[1]
    );
  });

  it("遅れて完了した前月Responseで表示を巻き戻さない", async () => {
    let resolveNovember!: (value: AdminNotificationListResponse) => void;
    const novemberRequest = new Promise<AdminNotificationListResponse>(
      (resolve) => {
        resolveNovember = resolve;
      }
    );
    const decemberItem = cloneFixture(adminNotificationListFixture.items[1]);
    decemberItem.content.push.title = "12月の通知";
    decemberItem.schedules[0].sendAt = "2026-12-03T10:00:00+09:00";
    const list = vi
      .fn()
      .mockResolvedValueOnce(adminNotificationListFixture)
      .mockReturnValueOnce(novemberRequest)
      .mockResolvedValueOnce({ items: [decemberItem] });
    const user = userEvent.setup();
    renderPage(createQueryApi(list));
    await screen.findByText("通知101");
    await user.click(screen.getByRole("button", { name: "カレンダー表示" }));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole("button", { name: "次の月" }));
    expect(await screen.findByText("12月の通知")).toBeInTheDocument();

    const novemberItem = cloneFixture(adminNotificationListFixture.items[0]);
    novemberItem.content.push.title = "遅い11月の通知";
    await act(async () => {
      resolveNovember({ items: [novemberItem] });
      await novemberRequest;
    });

    expect(screen.getByText("12月の通知")).toBeInTheDocument();
    expect(screen.queryByText("遅い11月の通知")).not.toBeInTheDocument();
  });

  it("Calendarのemptyをloading・errorと同時に表示しない", async () => {
    let resolveCalendar!: (value: AdminNotificationListResponse) => void;
    const calendarRequest = new Promise<AdminNotificationListResponse>(
      (resolve) => {
        resolveCalendar = resolve;
      }
    );
    const list = vi
      .fn()
      .mockResolvedValueOnce(adminNotificationListFixture)
      .mockReturnValueOnce(calendarRequest);
    const user = userEvent.setup();
    const { unmount } = renderPage(createQueryApi(list));
    await screen.findByText("通知101");

    await user.click(screen.getByRole("button", { name: "カレンダー表示" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "カレンダーを読み込み中です"
    );
    expect(
      screen.queryByText("この月に配信予定・配信済みの通知はありません")
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveCalendar({ items: [] });
      await calendarRequest;
    });
    expect(
      screen.getByText("この月に配信予定・配信済みの通知はありません")
    ).toBeInTheDocument();
    unmount();

    const errorList = vi
      .fn()
      .mockResolvedValueOnce(adminNotificationListFixture)
      .mockRejectedValueOnce(new Error("Calendar読込失敗"));
    renderPage(createQueryApi(errorList));
    await screen.findByText("通知101");
    await user.click(screen.getByRole("button", { name: "カレンダー表示" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "予期しないエラーが発生しました。"
    );
    expect(
      screen.queryByText("この月に配信予定・配信済みの通知はありません")
    ).not.toBeInTheDocument();
  });

  it("loading・empty・初期Errorを画面内で表示する", async () => {
    let resolveList!: (value: AdminNotificationListResponse) => void;
    const request = new Promise<AdminNotificationListResponse>((resolve) => {
      resolveList = resolve;
    });
    const { unmount } = renderPage(createQueryApi(vi.fn(() => request)));

    expect(screen.getByRole("status")).toHaveTextContent(
      "通知を読み込み中です"
    );
    await act(async () => {
      resolveList({ items: [] });
      await request;
    });
    expect(
      screen.getByText("条件に一致する通知はありません")
    ).toBeInTheDocument();
    unmount();

    renderPage(
      createQueryApi(vi.fn().mockRejectedValue(new Error("読込失敗")))
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });
});
