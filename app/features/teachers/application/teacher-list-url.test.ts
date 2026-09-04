import { describe, expect, it } from "vitest";

import {
  parseTeacherListUrl,
  updateTeacherListUrl,
} from "~/features/teachers/application/teacher-list-url";

describe("teacher list URL state", () => {
  it("検索・ページ・ソートをURLから正規化する", () => {
    expect(
      parseTeacherListUrl(
        "search=%20%E4%BD%90%E6%A9%8B%20&page=3&sortBy=displayName&sortOrder=desc"
      )
    ).toEqual({
      search: "佐橋",
      page: 3,
      sortBy: "displayName",
      sortOrder: "desc",
      isStaff: "all",
      isLiveActive: "all",
    });
  });

  it("不正なページ・ソート値をデフォルトへ戻す", () => {
    expect(
      parseTeacherListUrl("page=0&sortBy=classRoom&sortOrder=sideways")
    ).toEqual({
      search: "",
      page: 1,
      sortBy: null,
      sortOrder: null,
      isStaff: "all",
      isLiveActive: "all",
    });
  });

  it("検索変更時にページを削除し、既存の別パラメータを保持する", () => {
    expect(
      updateTeacherListUrl("tab=active&page=4&sortBy=teacherId", {
        search: "  佐橋 晴斗  ",
        page: 1,
      })
    ).toBe(
      "tab=active&sortBy=teacherId&search=%E4%BD%90%E6%A9%8B+%E6%99%B4%E6%96%97"
    );
  });

  it("2ページ目とソート状態をURLへ反映する", () => {
    expect(
      updateTeacherListUrl("search=%E4%BD%90%E6%A9%8B", {
        page: 2,
        sortBy: "displayName",
        sortOrder: "asc",
      })
    ).toBe("search=%E4%BD%90%E6%A9%8B&page=2&sortBy=displayName&sortOrder=asc");
  });
});
