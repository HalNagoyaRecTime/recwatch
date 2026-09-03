import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useFeedback } from "../hooks/useFeedback";
import { FeedbackProvider } from "./FeedbackProvider";
import { AppNotificationCenter } from "./AppNotificationCenter";

function SeedNotification() {
  const { report } = useFeedback();
  return (
    <button
      type="button"
      onClick={() =>
        report({
          kind: "action-error",
          title: "更新失敗",
          message: "更新できませんでした",
          diagnostic: {
            route: "/teachers",
            action: "更新",
            endpoint: "/api/teachers/1",
            status: 500,
            errorCode: "SERVER_ERROR",
            requestId: "req-123",
          },
        })
      }
    >
      seed
    </button>
  );
}

function renderCenter() {
  return render(
    <FeedbackProvider>
      <SeedNotification />
      <AppNotificationCenter />
    </FeedbackProvider>
  );
}

describe("AppNotificationCenter", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("空状態を表示する", () => {
    renderCenter();
    expect(screen.getByText("通知はありません")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "通知" }).closest(".scrollbar-none")
    ).not.toBeInTheDocument();
  });

  it("通知を表示し、行の確認で既読化とdiagnostic詳細を行う", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    const row = await screen.findByRole("button", {
      name: "更新失敗、エラー",
    });
    expect(screen.getAllByText("更新できませんでした").length).toBeGreaterThan(
      0
    );

    await user.click(row);
    expect(row).not.toHaveClass("bg-surface-muted");

    await user.click(screen.getByText("詳細"));
    expect(screen.getByText("SERVER_ERROR")).toBeInTheDocument();
    expect(screen.getByText("req-123")).toBeInTheDocument();
    expect(screen.getByText("/api/teachers/1")).toBeInTheDocument();
  });

  it("ゴミ箱アイコンから履歴を削除できる", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole("button", { name: "seed" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "すべて削除" })).toBeEnabled()
    );
    await user.click(screen.getByRole("button", { name: "すべて削除" }));
    expect(screen.getByText("通知はありません")).toBeInTheDocument();
  });
});
