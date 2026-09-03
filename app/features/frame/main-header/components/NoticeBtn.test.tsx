import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeedback } from "~/features/frame/feedback/hooks/useFeedback";
import { FeedbackProvider } from "~/features/frame/feedback/components/FeedbackProvider";
import {
  APP_NOTIFICATION_STORAGE_KEY,
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
        })
      }
    >
      report
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
      <FeedbackProvider>
        <SeedFeedback />
        <NoticeBtn />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "report" }));
    expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument();

    const noticeButton = screen.getByRole("button", { name: "通知" });
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
      APP_NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    );

    render(
      <FeedbackProvider>
        <NoticeBtn />
      </FeedbackProvider>
    );

    expect(await screen.findByText("99+")).toBeInTheDocument();
  });
});
