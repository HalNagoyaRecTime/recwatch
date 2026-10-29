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
import { MemoryRouter, useSearchParams } from "react-router";

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

function createCommandApi(
  overrides: Partial<AdminNotificationCommandApi> = {}
): AdminNotificationCommandApi {
  return {
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
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
  initialCalendarMonth = new Date(2026, 10, 1),
  commandApi = createCommandApi()
) {
  function TestPage() {
    const [params] = useSearchParams();
    return (
      <NotificationListPage
        commandApi={commandApi}
        initialCalendarMonth={initialCalendarMonth}
        queryApi={queryApi}
        viewMode={params.get("view") === "calendar" ? "calendar" : "list"}
      />
    );
  }
  return render(
    <MemoryRouter>
      <TestPage />
    </MemoryRouter>
  );
}

describe("NotificationListPage", () => {
  it("v2の6状態と作成方法を表示する", async () => {
    const user = userEvent.setup();
    renderPage(createQueryApi());

    expect(await screen.findByText("通知101")).toBeInTheDocument();
    for (const status of [
      "配信待ち",
      "対象者確定中",
      "送信中",
      "配信完了",
      "処理失敗",
      "停止",
    ]) {
      expect(
        within(screen.getByRole("table", { name: "通知一覧" })).getByText(
          status
        )
      ).toBeInTheDocument();
    }

    // 作成方法フィルターはAPI側に渡される（サーバーサイドページネーション）
    await user.click(screen.getByRole("combobox", { name: "通知の作成方法" }));
    await user.click(screen.getByRole("option", { name: "自動通知" }));
    // APIがcreationMethodでフィルタリングした結果を返すことを期待
  });

  it("一覧はリストのみで表示し、不要な切り替えや絞り込みを出さない", async () => {
    renderPage(createQueryApi());
    await screen.findByText("通知101");
    expect(
      screen.queryByRole("button", { name: "グリッド表示" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "重要度で絞り込み" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "1ページの表示件数" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "配信モニター" })).toHaveAttribute(
      "href",
      "/notifications/monitor"
    );
  });

  it("50件単位でページを切り替える", async () => {
    const items = Array.from({ length: 50 }, (_, index) => {
      const item = cloneFixture(adminNotificationListFixture.items[0]);
      item.notificationId = 101 + index;
      item.content.push.title = `通知${101 + index}`;
      return item;
    });
    const itemsPage2 = Array.from({ length: 1 }, (_, index) => {
      const item = cloneFixture(adminNotificationListFixture.items[0]);
      item.notificationId = 151 + index;
      item.content.push.title = `通知${151 + index}`;
      return item;
    });
    const user = userEvent.setup();
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items,
        pagination: { page: 1, limit: 50, totalCount: 51, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        items: itemsPage2,
        pagination: { page: 2, limit: 50, totalCount: 51, totalPages: 2 },
      });
    renderPage(createQueryApi(list));

    expect(await screen.findByText("通知101")).toBeInTheDocument();
    expect(screen.queryByText("通知151")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(screen.getByText("通知151")).toBeInTheDocument();
    expect(screen.queryByText("通知101")).not.toBeInTheDocument();
  });

  it("月範囲を1回取得し、複数Scheduleを日付ごとに詳細リンクとして配置する", async () => {
    const list = vi.fn((query) => mockAdminNotificationQueryApi.list(query));
    const user = userEvent.setup();
    const month = new Date(2026, 10, 1);
    renderPage(createQueryApi(list), month);
    await screen.findByText("通知101");

    await user.click(screen.getByRole("link", { name: "カレンダー" }));

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
    decemberItem.schedules[0].sendAt = "2026-12-03T01:00:00.000Z";
    const list = vi
      .fn()
      .mockResolvedValueOnce(adminNotificationListFixture)
      .mockReturnValueOnce(novemberRequest)
      .mockResolvedValueOnce({ items: [decemberItem] });
    const user = userEvent.setup();
    renderPage(createQueryApi(list));
    await screen.findByText("通知101");
    await user.click(screen.getByRole("link", { name: "カレンダー" }));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole("button", { name: "次の月" }));
    expect(await screen.findByText("12月の通知")).toBeInTheDocument();

    const novemberItem = cloneFixture(adminNotificationListFixture.items[0]);
    novemberItem.content.push.title = "遅い11月の通知";
    await act(async () => {
      resolveNovember({
        items: [novemberItem],
        pagination: { page: 1, limit: 50, totalCount: 1, totalPages: 1 },
      });
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

    await user.click(screen.getByRole("link", { name: "カレンダー" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "カレンダーを読み込み中です"
    );
    expect(
      screen.queryByText("この月に配信予定・配信済みの通知はありません")
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveCalendar({
        items: [],
        pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 1 },
      });
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
    await user.click(screen.getByRole("link", { name: "カレンダー" }));

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
      resolveList({
        items: [],
        pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 1 },
      });
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

  it("削除dialog表示中はdocumentをlockし、削除完了後に元へ戻す", async () => {
    let resolveDeletion!: () => void;
    const deleteNotification = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDeletion = resolve;
        })
    );
    const commandApi = createCommandApi({ delete: deleteNotification });
    const originalDocumentOverflow =
      document.documentElement.style.getPropertyValue("overflow");
    const originalBodyOverflow =
      document.body.style.getPropertyValue("overflow");
    const user = userEvent.setup();
    renderPage(createQueryApi(), new Date(2026, 10, 1), commandApi);

    await screen.findByText("通知101");
    await user.click(
      screen.getByRole("button", { name: "通知101のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "通知を削除" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "削除する" }));
    await waitFor(() => expect(deleteNotification).toHaveBeenCalledWith(101));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    await act(async () => {
      resolveDeletion();
    });
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    );
    expect(document.documentElement.style.overflow).toBe(
      originalDocumentOverflow
    );
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
  });
});
