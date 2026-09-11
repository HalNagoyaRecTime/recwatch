import { describe, expect, it } from "vitest";

import { isAccountUser } from "./account-user-guard";

describe("isAccountUser", () => {
  it("is_staffが未指定でもユーザー情報を有効として扱う", () => {
    expect(
      isAccountUser({
        id: "user-1",
        email: "user@example.com",
        display_name: "一般ユーザー",
      })
    ).toBe(true);
  });
});
