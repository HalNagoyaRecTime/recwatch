import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

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

describe("FeedbackProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    expect(
      screen.getByRole("button", { name: "通知を小さくする" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "通知を小さくする" }));
    expect(screen.queryByText("保存できませんでした")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "通知を元に戻す" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "通知を元に戻す" }));
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
});
