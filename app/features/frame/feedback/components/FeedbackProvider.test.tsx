import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  APP_NOTIFICATION_MAX_COUNT,
  APP_NOTIFICATION_RETENTION_MS,
  getAppNotificationStorageKey,
  type AppNotification,
} from "../model/app-notification";
import { useFeedback } from "../hooks/useFeedback";
import { FeedbackToastHost } from "./FeedbackToastHost";
import { FeedbackProvider } from "./FeedbackProvider";

function FeedbackProbe() {
  const { notifications, toasts, unreadCount, report } = useFeedback();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          report({
            kind: "action-error",
            title: "保存失敗",
            message: "保存できませんでした",
            diagnostic: { endpoint: "/api/items", status: 500 },
          })
        }
      >
        error
      </button>
      <button
        type="button"
        onClick={() =>
          report({
            kind: "action-success",
            title: "保存完了",
            message: "保存しました",
          })
        }
      >
        success
      </button>
      <button
        type="button"
        onClick={() =>
          report({
            kind: "background-error",
            title: "同期失敗",
            message: "同期できませんでした",
          })
        }
      >
        background
      </button>
      <output data-testid="history-count">{notifications.length}</output>
      <output data-testid="toast-count">{toasts.length}</output>
      <output data-testid="unread-count">{unreadCount}</output>
    </>
  );
}

function renderProbe() {
  return render(
    <FeedbackProvider userId="test-user">
      <FeedbackToastHost />
      <FeedbackProbe />
    </FeedbackProvider>
  );
}

function createStoredNotification(
  overrides: Partial<AppNotification> = {}
): AppNotification {
  return {
    id: "stored-notification",
    kind: "background-error",
    severity: "error",
    title: "同期失敗",
    message: "同期できませんでした",
    createdAt: new Date().toISOString(),
    read: false,
    ...overrides,
  };
}

function dispatchStorageEvent(
  userId: string,
  notifications: AppNotification[],
  storageArea: Storage | null = window.localStorage
) {
  const key = getAppNotificationStorageKey(userId);
  const newValue = JSON.stringify(notifications);
  window.localStorage.setItem(key, newValue);
  window.dispatchEvent(
    new StorageEvent("storage", { key, newValue, storageArea })
  );
}

describe("FeedbackProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Provider外でuseFeedbackを呼ぶと明確なエラーになる", () => {
    function OutsideProbe() {
      useFeedback();
      return null;
    }
    expect(() => render(<OutsideProbe />)).toThrow(
      "useFeedback must be used within FeedbackProvider"
    );
  });

  it("ユーザーごとに履歴とToastを分離し、旧global keyを引き継がない", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FeedbackProvider key="user-a" userId="user-a">
        <FeedbackProbe />
      </FeedbackProvider>
    );
    await user.click(screen.getByRole("button", { name: "error" }));
    expect(screen.getByTestId("history-count")).toHaveTextContent("1");
    expect(
      window.localStorage.getItem(getAppNotificationStorageKey("user-a"))
    ).toContain("保存失敗");

    rerender(
      <FeedbackProvider key="user-b" userId="user-b">
        <FeedbackProbe />
      </FeedbackProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("history-count")).toHaveTextContent("0");
      expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    });

    window.localStorage.setItem("recwatch.app-notifications", "legacy");
    rerender(
      <FeedbackProvider key="user-b" userId="user-b">
        <FeedbackProbe />
      </FeedbackProvider>
    );
    expect(screen.getByTestId("history-count")).toHaveTextContent("0");
    expect(screen.queryByText("保存失敗")).not.toBeInTheDocument();
  });

  it("action-errorをToast一回と履歴一件へ同じイベントとして追加する", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "error" }));

    expect(screen.getByTestId("history-count")).toHaveTextContent("1");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
    expect(screen.getByText("保存失敗")).toBeInTheDocument();
    expect(screen.getByText("保存できませんでした")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("feedback-toast-enter");
    expect(
      JSON.parse(
        window.localStorage.getItem(
          getAppNotificationStorageKey("test-user")
        ) ?? "[]"
      )
    ).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "通知を閉じる" }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    expect(screen.getByTestId("history-count")).toHaveTextContent("1");
  });

  it("action-successはToastだけを表示し履歴へ保存しない", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "success" }));

    expect(screen.getByTestId("history-count")).toHaveTextContent("0");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
    expect(screen.getByText("保存完了")).toBeInTheDocument();
  });

  it("background-errorを履歴へ保存する", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "background" }));

    expect(screen.getByTestId("history-count")).toHaveTextContent("1");
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
  });

  it("localStorageから復元し、30日超過と上限超過をcleanupする", async () => {
    const now = Date.now();
    const notifications: AppNotification[] = Array.from(
      { length: APP_NOTIFICATION_MAX_COUNT + 1 },
      (_, index) => ({
        id: `notification-${index}`,
        kind: "background-success",
        severity: "success",
        title: `通知${index}`,
        message: "完了",
        createdAt: new Date(now - index * 1000).toISOString(),
        read: false,
      })
    );
    notifications.push({
      id: "old",
      kind: "background-error",
      severity: "error",
      title: "古い通知",
      message: "期限切れ",
      createdAt: new Date(
        now - APP_NOTIFICATION_RETENTION_MS - 1
      ).toISOString(),
      read: false,
    });
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify(notifications)
    );

    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent(
        String(APP_NOTIFICATION_MAX_COUNT)
      )
    );
    expect(screen.queryByText("古い通知")).not.toBeInTheDocument();
    expect(
      JSON.parse(
        window.localStorage.getItem(
          getAppNotificationStorageKey("test-user")
        ) ?? "[]"
      )
    ).toHaveLength(APP_NOTIFICATION_MAX_COUNT);
  });

  it("localStorageから復元するdiagnosticを許可項目だけに制限する", async () => {
    const storedNotification: AppNotification & {
      diagnostic: AppNotification["diagnostic"] & Record<string, unknown>;
    } = {
      id: "unsafe-notification",
      kind: "action-error",
      severity: "error",
      title: "エラー",
      message: "失敗",
      createdAt: new Date().toISOString(),
      read: false,
      diagnostic: {
        endpoint: "/api/items",
        status: 500,
        requestId: "req-1",
        password: "secret",
        responseBody: { token: "secret" },
      },
    };
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify([storedNotification])
    );

    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    );

    const [notification] = JSON.parse(
      window.localStorage.getItem(getAppNotificationStorageKey("test-user")) ??
        "[]"
    ) as AppNotification[];
    expect(notification.diagnostic).toEqual({
      endpoint: "/api/items",
      status: 500,
      requestId: "req-1",
    });
  });

  it("localStorageの読み込み失敗を警告する", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("broken storage");
    });

    renderProbe();

    expect(warn).toHaveBeenCalledWith(
      "通知履歴の読み込みに失敗しました。",
      expect.any(Error)
    );
  });

  it("localStorageの保存失敗を警告する", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    renderProbe();
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        "通知履歴の保存に失敗しました。",
        expect.any(Error)
      )
    );
  });

  it("対象storage keyのstorageイベントで通知一覧を再読み込みする", async () => {
    renderProbe();
    const notification = createStoredNotification();

    dispatchStorageEvent("test-user", [notification]);

    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    );
  });

  it("他ユーザーや別storage keyのstorageイベントでは状態を変更しない", async () => {
    renderProbe();
    const notification = createStoredNotification();
    const otherUserKey = getAppNotificationStorageKey("other-user");

    window.localStorage.setItem(otherUserKey, JSON.stringify([notification]));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: otherUserKey,
        newValue: JSON.stringify([notification]),
        storageArea: window.localStorage,
      })
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "recwatch.app-notifications:unrelated",
        newValue: JSON.stringify([notification]),
        storageArea: window.localStorage,
      })
    );

    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("0")
    );
  });

  it("userId変更時に履歴を再読み込みし、購読先を切り替える", async () => {
    const first = createStoredNotification({ id: "user-a-notification" });
    const second = createStoredNotification({ id: "user-b-notification" });
    const third = createStoredNotification({
      id: "user-b-second-notification",
    });
    const { rerender } = render(
      <FeedbackProvider userId="user-a">
        <FeedbackProbe />
      </FeedbackProvider>
    );

    dispatchStorageEvent("user-a", [first]);
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    );

    window.localStorage.setItem(
      getAppNotificationStorageKey("user-b"),
      JSON.stringify([second, third])
    );
    rerender(
      <FeedbackProvider userId="user-b">
        <FeedbackProbe />
      </FeedbackProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("2")
    );

    dispatchStorageEvent("user-a", [
      first,
      createStoredNotification({ id: "old-user-notification" }),
    ]);
    expect(screen.getByTestId("history-count")).toHaveTextContent("2");

    dispatchStorageEvent("user-b", [second]);
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    );
  });

  it("他タブ側で追加された通知を既存の履歴を残して反映する", async () => {
    const first = createStoredNotification({ id: "first" });
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify([first])
    );
    renderProbe();

    dispatchStorageEvent("test-user", [
      first,
      createStoredNotification({ id: "second", title: "新しい通知" }),
    ]);

    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("2")
    );
  });

  it("storageイベントによる再同期で通知履歴を同じ内容へ書き戻さない", async () => {
    const first = createStoredNotification({ id: "first" });
    const second = createStoredNotification({ id: "second" });
    const key = getAppNotificationStorageKey("test-user");
    window.localStorage.setItem(key, JSON.stringify([first]));
    renderProbe();

    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const newValue = JSON.stringify([first, second]);
    window.localStorage.setItem(key, newValue);
    setItem.mockClear();
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue,
        storageArea: window.localStorage,
      })
    );

    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("2")
    );
    expect(setItem).not.toHaveBeenCalled();
  });

  it("他タブ側で既読化された状態を反映する", async () => {
    const notification = createStoredNotification({ id: "to-read" });
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify([notification])
    );
    renderProbe();
    expect(screen.getByTestId("unread-count")).toHaveTextContent("1");

    dispatchStorageEvent("test-user", [{ ...notification, read: true }]);

    await waitFor(() =>
      expect(screen.getByTestId("unread-count")).toHaveTextContent("0")
    );
  });

  it("他タブ側で個別削除と全削除された状態を反映する", async () => {
    const first = createStoredNotification({ id: "first" });
    const second = createStoredNotification({ id: "second" });
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify([first, second])
    );
    renderProbe();

    dispatchStorageEvent("test-user", [second]);
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("1")
    );

    dispatchStorageEvent("test-user", []);
    await waitFor(() =>
      expect(screen.getByTestId("history-count")).toHaveTextContent("0")
    );

    const key = getAppNotificationStorageKey("test-user");
    window.localStorage.removeItem(key);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: null,
        storageArea: window.localStorage,
      })
    );
    await waitFor(() => expect(window.localStorage.getItem(key)).toBeNull());
  });

  it("コンポーネント破棄後にstorage listenerを解除する", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderProbe();
    const storageListenerCall = addEventListener.mock.calls.find(
      ([eventType]) => eventType === "storage"
    );

    expect(storageListenerCall).toBeDefined();
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "storage",
      storageListenerCall?.[1]
    );
  });
});
