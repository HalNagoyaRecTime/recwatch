import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ThemeContext,
  type ThemeContextType,
} from "~/components/providers/ThemeProvider";
import { AccountMenuPanel } from "./AccountMenuPanel";
import { getAccountBtnData } from "../model/account-btn-data";

const themeContext: ThemeContextType = {
  theme: "light",
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
};

describe("AccountMenuPanel", () => {
  it("mouse操作ではテーマ設定をhoverで開ける", async () => {
    const user = userEvent.setup();

    render(
      <ThemeContext.Provider value={themeContext}>
        <AccountMenuPanel account={getAccountBtnData()} onClose={vi.fn()} />
      </ThemeContext.Provider>
    );

    await user.hover(screen.getByRole("button", { name: "テーマ設定" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("touch操作ではテーマ設定をtapで開ける", async () => {
    const user = userEvent.setup();

    render(
      <ThemeContext.Provider value={themeContext}>
        <AccountMenuPanel account={getAccountBtnData()} onClose={vi.fn()} />
      </ThemeContext.Provider>
    );

    const themeTrigger = screen.getByRole("button", { name: "テーマ設定" });
    await user.pointer({ keys: "[TouchA>]", target: themeTrigger });
    await user.pointer({ keys: "[/TouchA]", target: themeTrigger });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
