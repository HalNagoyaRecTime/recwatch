import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
  const callbacks = {
    onChangeActive: vi.fn(),
    onChangeStaff: vi.fn(),
    onClearError: vi.fn(),
    onEdit: vi.fn(),
  };
  render(
    <TeacherActionMenu {...callbacks} teacher={{ ...teacher, ...overrides }} />
  );
  return callbacks;
}

describe("TeacherActionMenu", () => {
  it("有効状態を変更する操作をPageへ通知してメニューを閉じる", async () => {
    const callbacks = renderMenu();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "佐橋 晴斗の操作" }));
    await user.click(screen.getByRole("button", { name: "教官を無効化する" }));

    expect(callbacks.onChangeActive).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: "教官を無効化する" })
    ).not.toBeInTheDocument();
  });

  it("staff権限の変更と編集操作をPageへ通知する", async () => {
    const callbacks = renderMenu();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "佐橋 晴斗の操作" }));
    await user.click(
      screen.getByRole("button", { name: "staff権限を付与する" })
    );
    expect(callbacks.onChangeStaff).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "佐橋 晴斗の操作" }));
    await user.click(screen.getByRole("button", { name: "教官を編集する" }));
    expect(callbacks.onEdit).toHaveBeenCalledOnce();
    expect(callbacks.onClearError).toHaveBeenCalled();
  });
});
