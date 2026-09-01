import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FloatingPanel } from "./FloatingPanel";

describe("FloatingPanel", () => {
  it("クリックで開いたパネルへTabで移動し、Escapeでトリガーへ戻る", async () => {
    const user = userEvent.setup();

    render(
      <FloatingPanel
        content={<button type="button">項目</button>}
        trigger={<button type="button">開く</button>}
      />
    );

    const trigger = screen.getByRole("button", { name: "開く" });
    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("button", { name: "項目" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("パネルをviewport内のサイズに制限し、超過時にスクロールできる", async () => {
    const user = userEvent.setup();

    render(
      <FloatingPanel
        content={<div>内容</div>}
        trigger={<button type="button">開く</button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const panel = screen.getByRole("dialog");
    expect(panel).toHaveStyle({
      maxHeight: expect.stringMatching(/px$/),
      maxWidth: expect.stringMatching(/px$/),
      overflow: "auto",
    });
  });
});
