import { describe, expect, it } from "vitest";

import {
  clearClassRoomMembershipUrl,
  parseClassRoomMembershipUrl,
  updateClassRoomMembershipUrl,
} from "~/features/students/application/class-room-membership-url";

describe("class room membership URL state", () => {
  it("所属一覧と検索結果のページ、検索語をURLから読み取る", () => {
    expect(
      parseClassRoomMembershipUrl(
        "memberPage=3&studentSearch=%20%E5%B1%B1%E7%94%B0%20%E8%8A%B1%E5%AD%90%20&studentSearchPage=2"
      )
    ).toEqual({
      memberPage: 3,
      studentSearch: "山田 花子",
      studentSearchPage: 2,
    });
  });

  it("検索条件の変更時に検索結果を1ページ目へ戻し、一覧条件を保持する", () => {
    expect(
      updateClassRoomMembershipUrl(
        "search=1A&memberPage=2&studentSearchPage=4",
        { studentSearch: "山田 花子", studentSearchPage: 1 }
      )
    ).toBe(
      "search=1A&memberPage=2&studentSearch=%E5%B1%B1%E7%94%B0+%E8%8A%B1%E5%AD%90"
    );
  });

  it("別のクラスを開く前に所属一覧専用の条件だけを削除する", () => {
    expect(
      clearClassRoomMembershipUrl(
        "search=1A&page=2&memberPage=3&studentSearch=%E5%B1%B1%E7%94%B0&studentSearchPage=2"
      )
    ).toBe("search=1A&page=2");
  });
});
