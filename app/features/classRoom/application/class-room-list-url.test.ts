import { describe, expect, it } from "vitest";

import {
  parseClassRoomListUrl,
  updateClassRoomListUrl,
} from "~/features/classRoom/application/class-room-list-url";

describe("ClassRoom list URL state", () => {
  it("未指定時は初期ページと空のソートを返す", () => {
    expect(parseClassRoomListUrl("")).toEqual({
      search: "",
      page: 1,
      sortBy: null,
      sortOrder: null,
    });
  });

  it("search、sort、ページを復元する", () => {
    expect(
      parseClassRoomListUrl(
        "search=%20IH13A%20&page=3&sortBy=studentCount&sortOrder=desc"
      )
    ).toEqual({
      search: "IH13A",
      page: 3,
      sortBy: "studentCount",
      sortOrder: "desc",
    });
  });

  it("不正なsortは無視する", () => {
    expect(
      parseClassRoomListUrl("sortBy=invalid&sortOrder=sideways&page=0")
    ).toMatchObject({ page: 1, sortBy: null, sortOrder: null });
  });

  it("一覧状態をURLへ書き込む", () => {
    expect(
      updateClassRoomListUrl("tab=classrooms", {
        search: "IH13A",
        page: 2,
        sortBy: "classCode",
        sortOrder: "asc",
      })
    ).toBe("tab=classrooms&search=IH13A&page=2&sortBy=classCode&sortOrder=asc");
  });
});
