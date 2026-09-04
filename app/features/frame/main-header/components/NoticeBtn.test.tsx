import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";
import { FeedbackProvider } from "~/features/frame/feedback/components/FeedbackProvider";
import { FeedbackToastHost } from "~/features/frame/feedback/components/FeedbackToastHost";
import {
  getAppNotificationStorageKey,
  type AppNotification,
} from "~/features/frame/feedback/model/app-notification";
import { NoticeBtn } from "./NoticeBtn";

function SeedFeedback() {
  const { report } = useFeedback();
  return (
    <button
      type="button"
      onClick={() =>
        report({
          kind: "action-error",
          title: "保存失敗",
          message: "もう一度お試しください",
          diagnostic: { route: "/items", action: "save", status: 500 },
        })
      }
    >
      report
    </button>
  );
}

function SeedSuccess() {
  const { report } = useFeedback();
  return (
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
  );
}

describe("NoticeBtn", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("未読通知があるとき既存の通知ボタンからNotification Centerを開閉できる", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <SeedFeedback />
        <NoticeBtn />
      </FeedbackProvider>
    );

    expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "report" }));
    expect(
      screen.getByRole("button", { name: "通知、1件の未読通知" })
    ).toBeInTheDocument();

    const noticeButton = screen.getByRole("button", {
      name: "通知、1件の未読通知",
    });
    expect(noticeButton).toHaveAttribute("aria-expanded", "false");
    await user.click(noticeButton);
    expect(screen.getByRole("heading", { name: "通知" })).toBeInTheDocument();
    expect(screen.getByText("保存失敗")).toBeInTheDocument();

    await user.click(noticeButton);
    expect(
      screen.queryByRole("heading", { name: "通知" })
    ).not.toBeInTheDocument();
  });

  it("未読件数を99+まで表示する", async () => {
    const notifications: AppNotification[] = Array.from(
      { length: 100 },
      (_, index) => ({
        id: `notification-${index}`,
        kind: "background-error",
        severity: "error",
        title: `通知${index}`,
        message: "失敗しました",
        createdAt: new Date().toISOString(),
        read: false,
      })
    );
    window.localStorage.setItem(
      getAppNotificationStorageKey("test-user"),
      JSON.stringify(notifications)
    );

    render(
      <FeedbackProvider userId="test-user">
        <NoticeBtn />
      </FeedbackProvider>
    );

    expect(await screen.findByText("99+")).toBeInTheDocument();
  });

  it("開いたパネルでBellのArrowDownから最初の通知へ移動できる", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <SeedFeedback />
        <NoticeBtn />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "report" }));
    const noticeButton = screen.getByRole("button", {
      name: "通知、1件の未読通知",
    });
    await user.click(noticeButton);
    noticeButton.focus();
    fireEvent.keyDown(noticeButton, { key: "ArrowDown" });

    expect(document.activeElement).toHaveAttribute(
      "aria-label",
      expect.stringContaining("詳細")
    );
  });

  it("閉じたBellのArrowDownでパネルを開き最初の通知へ移動できる", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <SeedFeedback />
        <NoticeBtn />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "report" }));
    const noticeButton = screen.getByRole("button", {
      name: "通知、1件の未読通知",
    });
    noticeButton.focus();
    fireEvent.keyDown(noticeButton, { key: "ArrowDown" });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "通知" })).toBeInTheDocument();
      expect(document.activeElement).toHaveAttribute(
        "aria-label",
        expect.stringContaining("詳細")
      );
    });
  });

  it("通知センターに保存されないToastのクリックではパネルを開かない", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackToastHost />
        <SeedSuccess />
        <NoticeBtn />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "success" }));
    await user.click(screen.getByRole("status"));

    expect(
      screen.queryByRole("heading", { name: "通知" })
    ).not.toBeInTheDocument();
  });

  it("Toastをクリックすると該当通知の詳細を開いた状態で表示する", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackToastHost />
        <SeedFeedback />
        <NoticeBtn />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "report" }));
    await user.click(screen.getByRole("alert"));

    expect(
      await screen.findByRole("heading", { name: "通知" })
    ).toBeInTheDocument();
    const row = screen.getByRole("listitem");
    expect(row.firstElementChild).toHaveClass("bg-surface-muted");
    expect(
      screen.getByRole("button", { name: /保存失敗.*詳細を閉じる/ })
    ).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: "通知を小さくする" }));
    expect(row.firstElementChild).not.toHaveClass("bg-surface-muted");
  });
});
