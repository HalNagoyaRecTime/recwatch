import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormModal } from "./FormModal";

describe("FormModal", () => {
  it("フォーカスをモーダル内に閉じ込める", async () => {
    const user = userEvent.setup();

    render(
      <FormModal description="説明" onClose={vi.fn()} title="登録">
        <input aria-label="名前" />
        <button type="button">保存</button>
      </FormModal>
    );

    const closeButton = screen.getByRole("button", { name: "閉じる" });
    const input = screen.getByLabelText("名前");
    const saveButton = screen.getByRole("button", { name: "保存" });

    await waitFor(() => expect(closeButton).toHaveFocus());
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    expect(saveButton).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(saveButton).toHaveFocus();
  });
});
