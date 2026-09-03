import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "./FeedbackProvider";
import { FeedbackTestButton } from "./FeedbackTestButton";
import { getAppNotificationStorageKey } from "../model/app-notification";

function NotificationProbe() {
  const { notifications } = useFeedback();
  return (
    <output>{notifications.map((notification) => notification.title)}</output>
  );
}

describe("FeedbackTestButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("開発用ボタンから表示確認用イベントを1件発生させる", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackTestButton />
        <NotificationProbe />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "通知テスト" }));

    expect(
      screen.getByText("テスト通知", { exact: false })
    ).toBeInTheDocument();
    expect(
      window.localStorage.getItem(getAppNotificationStorageKey("test-user"))
    ).toContain("テスト通知");
  });

  it("クリックごとに複数の通知バリエーションを発生させる", async () => {
    const user = userEvent.setup();
    render(
      <FeedbackProvider userId="test-user">
        <FeedbackTestButton />
        <NotificationProbe />
      </FeedbackProvider>
    );
    const button = screen.getByRole("button", { name: "通知テスト" });

    await user.click(button);
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(
      screen.getByText("テスト通知", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(/テスト通知（警告）/)).toBeInTheDocument();
    expect(screen.getByText(/テスト通知（完了）/)).toBeInTheDocument();
  });
});
