import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { ApiClientError } from "~/lib/api-client-error";
import type { ManagedNotification } from "~/features/notifications/model/notification";
import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";

afterEach(cleanup);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderPage(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const draftNotification: ManagedNotification = {
  id: 10,
  title: "集合場所変更",
  body: "集合場所は体育館です。",
  audienceName: "配信対象者（30名）",
  recipientCount: 30,
  scheduledAt: "2026-11-07T09:00:00+09:00",
  creatorName: "HAL 太郎",
  relatedEventId: null,
  relatedEventName: null,
  status: "draft",
  deliverySummary: {
    total: 30,
    draft: 30,
    sending: 0,
    sent: 0,
    failed: 0,
  },
  createdAt: "2026-11-07T08:00:00+09:00",
  updatedAt: "2026-11-07T08:00:00+09:00",
};

function createGateway(
  overrides: Partial<NotificationManagementApi> = {}
): NotificationManagementApi {
  return {
    list: vi.fn().mockResolvedValue({
      notifications: [draftNotification],
      total: 1,
      limit: 20,
      offset: 0,
    }),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

async function openDeleteMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("button", {
      name: "集合場所変更のその他の操作",
    })
  );
  await user.click(screen.getByRole("button", { name: "通知を削除" }));
}

describe("NotificationListPage", () => {
  it("未実装の表示範囲には選択肢のラベルで明示する", async () => {
    const user = userEvent.setup();

    renderPage(<NotificationListPage api={createGateway()} />);

    await user.click(
      await screen.findByRole("combobox", {
        name: /通知の表示範囲（自動・手動は未実装）/,
      })
    );

    expect(
      screen.getByRole("option", { name: "すべて表示" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "自動（未実装）" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "手動（未実装）" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /^未実装$/ })
    ).not.toBeInTheDocument();
  });

  it("カレンダー・グリッド表示では一覧を隠して未実装を表示する", async () => {
    const user = userEvent.setup();

    renderPage(<NotificationListPage api={createGateway()} />);

    await user.click(
      await screen.findByRole("button", { name: "カレンダー表示" })
    );

    expect(
      screen.getByRole("status", { name: "通知の表示形式（未実装）" })
    ).toHaveTextContent("未実装");
    expect(
      screen.queryByRole("table", { name: "通知一覧" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "グリッド表示" }));

    expect(
      screen.getByRole("status", { name: "通知の表示形式（未実装）" })
    ).toHaveTextContent("未実装");
    expect(
      screen.queryByRole("table", { name: "通知一覧" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "リスト表示" }));

    expect(screen.getByRole("table", { name: "通知一覧" })).toBeInTheDocument();
    expect(
      screen.queryByRole("status", { name: "通知の表示形式（未実装）" })
    ).not.toBeInTheDocument();
  });

  it("ページ移動時にmake-pageのページサイズで次の一覧を取得する", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) => ({
      ...draftNotification,
      id: index + 1,
      title: `通知${index + 1}`,
    }));
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: firstPage,
        total: 21,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [{ ...draftNotification, id: 21, title: "通知21" }],
        total: 21,
        limit: 20,
        offset: 20,
      });
    const user = userEvent.setup();

    renderPage(<NotificationListPage api={createGateway({ list })} />);

    await user.click(await screen.findByRole("button", { name: "次のページ" }));

    expect(await screen.findByText("通知21")).toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(1, { limit: 20, offset: 0 });
    expect(list).toHaveBeenNthCalledWith(2, { limit: 20, offset: 20 });
  });

  it("再読み込みボタンで現在ページの一覧を再取得して表示を更新する", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [{ ...draftNotification, title: "更新された通知" }],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const user = userEvent.setup();

    renderPage(<NotificationListPage api={createGateway({ list })} />);

    await screen.findByText("集合場所変更");
    await user.click(
      screen.getByRole("button", { name: "通知一覧を再読み込み" })
    );

    expect(await screen.findByText("更新された通知")).toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(1, { limit: 20, offset: 0 });
    expect(list).toHaveBeenNthCalledWith(2, { limit: 20, offset: 0 });
  });

  it("idを表示し、id列を昇順・降順で並べ替える", async () => {
    const list = vi.fn().mockResolvedValue({
      notifications: [
        { ...draftNotification, id: 20, title: "通知20" },
        { ...draftNotification, id: 3, title: "通知3" },
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    renderPage(<NotificationListPage api={createGateway({ list })} />);

    expect(await screen.findByText("20")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    const idSortButton = screen.getByRole("button", { name: "id" });
    await user.click(idSortButton);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("3");
    expect(rows[2]).toHaveTextContent("20");

    await user.click(idSortButton);
    const descendingRows = screen.getAllByRole("row");
    expect(descendingRows[1]).toHaveTextContent("20");
    expect(descendingRows[2]).toHaveTextContent("3");
  });

  it("配信中の通知では編集・削除を表示しない", async () => {
    const user = userEvent.setup();
    const sendingNotification: ManagedNotification = {
      ...draftNotification,
      status: "sending",
      deliverySummary: {
        total: 30,
        draft: 0,
        sending: 30,
        sent: 0,
        failed: 0,
      },
    };

    renderPage(
      <NotificationListPage
        api={createGateway({
          list: vi.fn().mockResolvedValue({
            notifications: [sendingNotification],
            total: 1,
            limit: 20,
            offset: 0,
          }),
        })}
      />
    );

    await user.click(
      await screen.findByRole("button", {
        name: "集合場所変更のその他の操作",
      })
    );

    expect(
      screen.getByRole("button", { name: "通知詳細" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通知を編集" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通知を削除" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("送信中")).toBeInTheDocument();
  });

  it.each([
    ["authentication_required", "ログインが必要です。"],
    ["forbidden", "通知を管理する権限がありません。"],
  ] as const)(
    "一覧取得時の%sエラーはアクセシブルに通知する",
    async (kind, message) => {
      const status = kind === "authentication_required" ? 401 : 403;
      renderPage(
        <NotificationListPage
          api={createGateway({
            list: vi
              .fn()
              .mockRejectedValue(new ApiClientError(status, message)),
          })}
        />
      );

      expect(
        await screen.findByText(message, { selector: "div" })
      ).toBeInTheDocument();
    }
  );

  it("削除成功後に対象の通知を一覧から除外する", async () => {
    const deleteNotification = vi.fn().mockResolvedValue(undefined);
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [],
        total: 0,
        limit: 20,
        offset: 0,
      });
    const user = userEvent.setup();

    renderPage(
      <NotificationListPage
        api={createGateway({ delete: deleteNotification, list })}
      />
    );

    await openDeleteMenu(user);
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => expect(deleteNotification).toHaveBeenCalledWith(10));
    expect(screen.queryByText("集合場所変更")).not.toBeInTheDocument();
  });

  it("409競合時に一覧を再取得してメッセージを表示する", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        notifications: [draftNotification],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        notifications: [
          {
            ...draftNotification,
            status: "sending",
            deliverySummary: {
              total: 30,
              draft: 0,
              sending: 30,
              sent: 0,
              failed: 0,
            },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const user = userEvent.setup();

    renderPage(
      <NotificationListPage
        api={createGateway({
          list,
          delete: vi
            .fn()
            .mockRejectedValue(
              new ApiClientError(
                409,
                "通知の配信状態が変更されました。一覧を再読み込みして確認してください。"
              )
            ),
        })}
      />
    );

    await openDeleteMenu(user);
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText(
        "通知の配信状態が変更されました。一覧を再読み込みして確認してください。",
        { selector: "div" }
      )
    ).toBeInTheDocument();
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText("送信中").length).toBeGreaterThanOrEqual(1);
  });
});
