import { describe, expect, it } from "vitest";

import { getAccountBtnData } from "./account-btn-data";

describe("getAccountBtnData", () => {
  it("認証APIの利用者名とメールを優先する", () => {
    expect(
      getAccountBtnData({
        id: "1",
        email: "user@example.com",
        display_name: "山田 花子",
      }).name
    ).toBe("山田 花子");
  });

  it("利用者情報が無い場合にモック利用者を表示しない", () => {
    expect(getAccountBtnData().name).toBe("ユーザー");
    expect(getAccountBtnData().imageUrl).toBeUndefined();
  });
});
