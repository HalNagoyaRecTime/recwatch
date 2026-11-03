import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import NotificationsRoute from "~/routes/main/notifications";
import NotificationsCalendarRoute from "~/routes/main/notifications.calendar";

vi.mock("~/features/frame/feedback", () => ({
  useFeedback: () => ({ report: vi.fn() }),
}));
vi.mock("~/features/frame/page-layout/PagePadding", () => ({
  PagePadding: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("~/features/frame/page-layout/PageLayout", () => ({
  PageLayout: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("~/features/notifications/pages/NotificationListPage", () => ({
  NotificationListPage: ({ viewMode }: { viewMode: string }) => (
    <div>画面: {viewMode}</div>
  ),
}));

function Location() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderRoute(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Location />
      <Routes>
        <Route path="/notifications" element={<NotificationsRoute />} />
        <Route
          path="/notifications/calendar"
          element={<NotificationsCalendarRoute />}
        />
        <Route
          path="/notifications/:notificationId"
          element={<div>通知詳細</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("通知カレンダーのルート", () => {
  it("専用 URL でカレンダーを表示する", () => {
    renderRoute("/notifications/calendar");
    expect(screen.getByText("画面: calendar")).toBeInTheDocument();
    expect(screen.queryByText("通知詳細")).not.toBeInTheDocument();
  });

  it("旧 URL から他のクエリを維持して移動する", async () => {
    renderRoute("/notifications?view=calendar&source=bookmark");
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/notifications/calendar?source=bookmark"
      )
    );
    expect(screen.getByText("画面: calendar")).toBeInTheDocument();
  });

  it("通知一覧の URL は一覧を表示する", () => {
    renderRoute("/notifications");
    expect(screen.getByText("画面: list")).toBeInTheDocument();
  });
});
