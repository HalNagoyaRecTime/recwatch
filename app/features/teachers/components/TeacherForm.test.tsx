import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TeacherForm } from "~/features/teachers/components/TeacherForm";

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
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(onSubmit).toHaveBeenCalledWith({
      classRoomIds: [4],
      userName: "新任",
    });
  });
});
