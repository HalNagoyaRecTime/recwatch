import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assignStaff: vi.fn(),
  revokeStaff: vi.fn(),
  updateUserStatus: vi.fn(),
}));

vi.mock("~/features/teachers/api", () => ({ TeacherApi: mocks }));

import { TeacherActionMenu } from "~/features/teachers/components/TeacherActionMenu";
import type { TeacherRow } from "~/features/teachers/model/teacher";

const teacher: TeacherRow = {
  teacherId: 7,
  userId: 11,
  displayName: "佐橋 晴斗",
  email: "sahashi@example.com",
  isLiveActive: true,
  isStaff: false,
  classRooms: [],
};

function renderMenu(overrides: Partial<TeacherRow> = {}) {
  return render(
    <MemoryRouter initialEntries={["/teachers?isLiveActive=all&page=2"]}>
      <TeacherActionMenu teacher={{ ...teacher, ...overrides }} />
    </MemoryRouter>
  );
}

describe("TeacherActionMenu", () => {
  it("userIdを使って有効状態を変更し、成功後にメニューを閉じる", async () => {
    mocks.updateUserStatus.mockResolvedValueOnce({
      user_id: 11,
      is_live_active: false,
    });
    const user = userEvent.setup();

    renderMenu();
    await user.click(screen.getByRole("button", { name: "佐橋 晴斗の操作" }));
    await user.click(screen.getByRole("button", { name: "教官を無効化する" }));

    await waitFor(() =>
      expect(mocks.updateUserStatus).toHaveBeenCalledWith(11, {
        is_live_active: false,
      })
    );
    expect(
      screen.queryByRole("button", { name: "教官を無効化する" })
    ).not.toBeInTheDocument();
  });

  it("staff付与・解除を専用APIへ送り、失敗時はエラーを表示する", async () => {
    mocks.assignStaff.mockResolvedValueOnce(undefined);
    mocks.revokeStaff.mockRejectedValueOnce(new Error("staff変更失敗"));
    const user = userEvent.setup();

    renderMenu();
    await user.click(screen.getByRole("button", { name: "佐橋 晴斗の操作" }));
    await user.click(
      screen.getByRole("button", { name: "staff権限を付与する" })
    );
    await waitFor(() => expect(mocks.assignStaff).toHaveBeenCalledWith(11));

    renderMenu({ isStaff: true });
    await user.click(
      screen.getAllByRole("button", { name: "佐橋 晴斗の操作" })[1]
    );
    await user.click(
      screen.getByRole("button", { name: "staff権限を解除する" })
    );

    await waitFor(() => expect(mocks.revokeStaff).toHaveBeenCalledWith(11));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "教官の状態変更に失敗しました。"
    );
  });
});
