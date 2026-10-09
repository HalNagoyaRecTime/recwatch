import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationActionMenu } from "~/features/notifications/components/list/NotificationActionMenu";
import {
  adminNotificationListFixture,
  cloneFixture,
} from "~/features/notifications/mock/notification-fixtures";

afterEach(cleanup);

describe("NotificationActionMenu", () => {
  it.each(["resolving", "sending", "completed", "failed", "stopped"] as const)(
    "%sでも編集画面へ移動でき、削除は表示しない",
    async (status) => {
      const notification = cloneFixture(adminNotificationListFixture.items[0]);
      notification.schedules.forEach((schedule) => {
        schedule.status = status;
      });
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/notifications"]}>
          <Routes>
            <Route
              path="/notifications"
              element={
                <NotificationActionMenu
                  notification={notification}
                  canModify={false}
                  onDelete={vi.fn()}
                />
              }
            />
            <Route
              path="/notifications/:id/edit"
              element={<p>詳細編集画面</p>}
            />
          </Routes>
        </MemoryRouter>
      );
      await user.click(
        screen.getByRole("button", { name: "通知101のその他の操作" })
      );
      expect(
        screen.queryByRole("button", { name: "通知を削除" })
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "通知を編集" }));
      expect(await screen.findByText("詳細編集画面")).toBeInTheDocument();
    }
  );
});
