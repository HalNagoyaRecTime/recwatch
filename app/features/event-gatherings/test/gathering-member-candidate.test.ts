import { describe, expect, it } from "vitest";

import { isDeletedStudent } from "~/features/event-gatherings/model/gathering-member-candidate";

describe("isDeletedStudent", () => {
  it("退会処理で匿名化された学籍番号だけを削除済みと判定する", () => {
    expect(isDeletedStudent({ studentNumber: "deleted-18" })).toBe(true);
    expect(isDeletedStudent({ studentNumber: "deleted-" })).toBe(false);
    expect(isDeletedStudent({ studentNumber: "deleted-user" })).toBe(false);
    expect(isDeletedStudent({ studentNumber: "HAL-deleted-18" })).toBe(false);
  });
});
