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

  it("右キーでテーマサブメニューを開き、左キーでテーマ設定へ戻る", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const trigger = screen.getByRole("button", { name: "ユーザー" });
    await user.click(trigger);
    await user.tab();
    const themeTrigger = screen.getByRole("button", { name: "テーマ設定" });

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "ライト" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(themeTrigger).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "ログアウト" })).toHaveFocus();
  }, 10000);

  it("テーマ設定で上キーを押すと全体を閉じてアカウントボタンへ戻る", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const accountTrigger = screen.getByRole("button", { name: "ユーザー" });
    await user.click(accountTrigger);
    await user.tab();

    await user.keyboard("{ArrowUp}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(accountTrigger).toHaveFocus();
  }, 10000);

  it("左キーでもテーマサブメニューを開ける", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    await user.click(screen.getByRole("button", { name: "ユーザー" }));
    await user.tab();
    await user.keyboard("{ArrowLeft}");

    expect(screen.getByRole("button", { name: "ライト" })).toHaveFocus();
  }, 10000);

  it("ログアウトから上キーでテーマ設定へ戻れる", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    await user.click(screen.getByRole("button", { name: "ユーザー" }));
    await user.tab();
    const themeTrigger = screen.getByRole("button", { name: "テーマ設定" });
    await user.keyboard("{ArrowDown}");

    const logout = screen.getByRole("button", { name: "ログアウト" });
    expect(logout).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(themeTrigger).toHaveFocus();
  }, 10000);

  it("アカウントメニューボタンから下キーでテーマ設定へ移動できる", async () => {
    const user = userEvent.setup();
    renderAccountButton();

    const accountTrigger = screen.getByRole("button", { name: "ユーザー" });
    accountTrigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("button", { name: "テーマ設定" })).toHaveFocus();
  }, 10000);

  it("サブメニューを開いた時は現在選択中のテーマへfocusする", async () => {
    const user = userEvent.setup();
    render(
      <ThemeContext.Provider value={{ ...themeContext, theme: "dark" }}>
        <AccountBtn onLogout={vi.fn()} />
      </ThemeContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: "ユーザー" }));
    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "ダーク" })).toHaveFocus();
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
