import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ThemeContext,
  type ThemeContextType,
} from "~/components/providers/ThemeProvider";

import { AccountBtn } from "./AccountBtn";

const themeContext: ThemeContextType = {
  theme: "light",
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
};

function renderAccountButton() {
  return render(
    <ThemeContext.Provider value={themeContext}>
      <AccountBtn onLogout={vi.fn()} />
    </ThemeContext.Provider>
  );
}

describe("AccountBtn", () => {
  it("開いた直後はトリガーにfocusを残し、Tabでメニューへ移動する", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const trigger = screen.getByRole("button", { name: "ユーザー" });
    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-controls");

    await user.tab();
    expect(screen.getByRole("button", { name: "テーマ設定" })).toHaveFocus();
    expect(screen.getAllByRole("dialog")).toHaveLength(2);

    await user.tab();
    const lightTheme = screen.getByRole("button", { name: "ライト" });
    expect(lightTheme).toHaveFocus();
    expect(lightTheme).toHaveClass("focus-visible:bg-surface-hover");

    await user.tab();
    expect(screen.getByRole("button", { name: "ダーク" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "システム" })).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("button", { name: "ダーク" })).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("button", { name: "ライト" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "ダーク" })).toHaveFocus();
  }, 10000);

  it("Escapeでアカウントメニューを閉じてトリガーへfocusを戻す", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const trigger = screen.getByRole("button", { name: "ユーザー" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  }, 10000);

  it("Shift+Tabでトリガーへfocusを戻す", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const trigger = screen.getByRole("button", { name: "ユーザー" });
    await user.click(trigger);
    await user.tab();

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(trigger).toHaveFocus();
  }, 10000);
});
