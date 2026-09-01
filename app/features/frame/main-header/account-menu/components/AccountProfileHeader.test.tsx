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
        })}
      />
    );

    expect(
      screen.getByText("非常に長いユーザー名が入っているアカウント")
    ).toHaveClass("min-w-0", "max-w-full", "truncate");
  });
});
