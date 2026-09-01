import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountMenuBtn } from "./AccountMenuBtn";
import { getAccountBtnData } from "../model/account-btn-data";

describe("AccountMenuBtn", () => {
  it("モバイルではアバターのみ、デスクトップでは名前と矢印を表示するクラスを持つ", () => {
    render(
      <AccountMenuBtn
        account={getAccountBtnData({
          display_name: "とても長いユーザー名",
          email: "user@example.com",
          id: "user-1",
        })}
        isOpen={false}
      />
    );

    const button = screen.getByRole("button");
    const name = screen.getByText("とても長いユーザー名");

    expect(button).toHaveClass(
      "w-8",
      "md:w-auto",
      "md:max-w-40",
      "md:rounded-l-[20px]!",
      "md:rounded-r-[8px]!"
    );
    expect(name).toHaveClass("hidden", "truncate", "md:block");
  });
});
