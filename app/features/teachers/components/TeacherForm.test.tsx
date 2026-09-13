import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TeacherForm } from "~/features/teachers/components/TeacherForm";

const initialTeacher = {
  teacherId: 7,
  userId: 11,
  displayName: "佐橋 晴斗",
  email: "sahashi@example.com",
  isLiveActive: true,
  isStaff: false,
  classRooms: [],
};

describe("TeacherForm", () => {
  it("空白だけの教官名を送信しない", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TeacherForm
        classRooms={[]}
        isSubmitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        submitError={null}
      />
    );

    await user.type(screen.getByLabelText("先生名"), "   ");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "教官名を入力してください。"
    );
  });

  it("担当クラスを選択して送信する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TeacherForm
        classRooms={[{ classRoomId: 4, className: "4年A組" }]}
        isSubmitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        submitError={null}
      />
    );

    await user.type(screen.getByLabelText("先生名"), "新任");
    await user.type(screen.getByLabelText("メールアドレス"), "new@example.com");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(onSubmit).toHaveBeenCalledWith({
      classRoomIds: [4],
      email: "new@example.com",
      userName: "新任",
    });
  });

  it("編集時は既存メールアドレスを初期値に表示する", () => {
    render(
      <TeacherForm
        classRooms={[]}
        initialTeacher={initialTeacher}
        isSubmitting={false}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        submitError={null}
      />
    );

    expect(screen.getByLabelText("メールアドレス")).toHaveValue(
      "sahashi@example.com"
    );
    expect(screen.queryByText(/未接続/)).not.toBeInTheDocument();
  });
});
