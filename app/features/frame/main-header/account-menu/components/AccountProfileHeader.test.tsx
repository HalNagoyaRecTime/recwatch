import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountProfileHeader } from "./AccountProfileHeader";
import { getAccountBtnData } from "../model/account-btn-data";

describe("AccountProfileHeader", () => {
  it("名前がパネル幅を超えた場合に省略できるクラスを持つ", () => {
    render(
      <AccountProfileHeader
        account={getAccountBtnData({
          display_name: "非常に長いユーザー名が入っているアカウント",
          email: "user@example.com",
          id: "user-1",
          is_staff: false,
        })}
      />
    );

    expect(
      screen.getByText("非常に長いユーザー名が入っているアカウント")
    ).toHaveClass("min-w-0", "max-w-full", "truncate");
  });

  it("staffユーザーの場合にロール表示を追加する", () => {
    render(
      <AccountProfileHeader
        account={getAccountBtnData({
          display_name: "スタッフ",
          email: "staff@example.com",
          id: "staff-1",
          is_staff: true,
        })}
      />
    );

    const role = screen.getByText("staff");

    expect(role).toHaveClass(
      "flex",
      "rounded-full",
      "border",
      "px-2",
      "font-bold"
    );
    expect(role).toHaveAttribute(
      "style",
      expect.stringContaining("color: var(--brand-primary)")
    );
    expect(role).toHaveAttribute(
      "style",
      expect.stringContaining("background: var(--surface-brand-soft)")
    );
    expect(role).toHaveAttribute(
      "style",
      expect.stringContaining("border-color: var(--brand-primary)")
    );
  });
});
