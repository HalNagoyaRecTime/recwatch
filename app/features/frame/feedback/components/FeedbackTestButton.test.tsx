import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "./FeedbackProvider";
import { FeedbackTestButton } from "./FeedbackTestButton";

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
      <FeedbackProvider>
        <FeedbackTestButton />
        <NotificationProbe />
      </FeedbackProvider>
    );

    await user.click(screen.getByRole("button", { name: "通知テスト" }));

    expect(screen.getByText("テスト通知")).toBeInTheDocument();
    expect(window.localStorage.getItem("recwatch.app-notifications")).toContain(
      "テスト通知"
    );
  });
});
