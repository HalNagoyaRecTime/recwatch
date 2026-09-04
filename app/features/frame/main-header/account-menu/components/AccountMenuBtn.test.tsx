import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountMenuBtn } from "./AccountMenuBtn";
import { getAccountBtnData } from "../model/account-btn-data";

describe("AccountMenuBtn", () => {
  it("アバター・長い名前・Chevronを同じボタン内で保持する", () => {
    render(
      <AccountMenuBtn
        account={getAccountBtnData({
          display_name: "とても長いユーザー名",
          email: "user@example.com",
          id: "user-1",
          is_staff: false,
        })}
        isOpen={false}
      />
    );

    const button = screen.getByRole("button");
    const name = screen.getByText("とても長いユーザー名");
    const chevron = button.querySelector("svg");

    expect(button).toHaveAccessibleName("アカウントメニュー");
    expect(button).toHaveClass(
      "w-8",
      "md:w-fit",
      "md:rounded-l-[20px]",
      "md:rounded-r-[8px]",
      "before:border",
      "before:border-border-base"
    );
    expect(button).not.toHaveClass("app-rounded");
    expect(name).toHaveClass("hidden", "min-w-0", "truncate", "md:block");
    expect(chevron).toHaveClass("hidden", "md:block");
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });

  it("既存のaria-labelを指定した場合は上書きしない", () => {
    render(
      <AccountMenuBtn
        account={getAccountBtnData()}
        isOpen={false}
        aria-label="ユーザーメニュー"
      />
    );

    expect(screen.getByRole("button")).toHaveAccessibleName("ユーザーメニュー");
  });

  it("開いた状態では外周ボーダーを強調する", () => {
    render(<AccountMenuBtn account={getAccountBtnData()} isOpen />);

    expect(screen.getByRole("button")).toHaveClass(
      "before:border-border-strong"
    );
  });
});
