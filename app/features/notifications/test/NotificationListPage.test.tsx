import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { NotificationListPage } from "~/features/notifications/pages/NotificationListPage";

afterEach(cleanup);

describe("NotificationListPage", () => {
  it("固定のデザイン用データで通知管理を表示する", () => {
    render(
      <MemoryRouter>
        <NotificationListPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("table", { name: "通知管理" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "通知管理" })
    ).toBeInTheDocument();
    expect(screen.getByText("競技開始時間の変更")).toBeInTheDocument();
    expect(screen.getByText("緊急連絡")).toBeInTheDocument();
  });

  it("APIを使わずに一覧の表示形式を切り替えられる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationListPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "グリッド表示" }));

    expect(
      screen.getByRole("status", { name: "通知の表示形式（未実装）" })
    ).toHaveTextContent("未実装");
    expect(
      screen.queryByRole("table", { name: "通知管理" })
    ).not.toBeInTheDocument();
  });

  it("一覧のデザイン上の並べ替えを切り替えられる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationListPage />
      </MemoryRouter>
    );

    const idSortButton = screen.getByRole("button", { name: "id" });
    await user.click(idSortButton);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("101");
    expect(rows[2]).toHaveTextContent("102");
  });

  it("行のその他の操作から編集画面へ遷移できる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NotificationListPage />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(
      screen.getAllByRole("button", { name: /その他の操作/ })
    ).toHaveLength(4);

    await user.click(
      screen.getByRole("button", {
        name: "競技開始時間の変更のその他の操作",
      })
    );
    await user.click(screen.getByRole("button", { name: "通知を編集" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/notifications/101/edit"
    );
  });
});

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}
