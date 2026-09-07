import { describe, expect, it } from "vitest";

import {
  parseStudentListUrl,
  updateStudentListUrl,
} from "~/features/students/application/student-list-url";

describe("student list URL state", () => {
  it("未指定時はstaff・activeをallへ正規化する", () => {
    expect(parseStudentListUrl("")).toEqual({
      search: "",
      page: 1,
      classRoomId: null,
      sortBy: null,
      sortOrder: null,
      isStaff: "all",
      isLiveActive: "all",
    });
  });

  it("検索・クラス・filter・sort・ページをURLから読み取る", () => {
    expect(
      parseStudentListUrl(
        "search=%20%E5%B1%B1%E7%94%B0%20&classRoomId=3&isStaff=true&isLiveActive=false&page=2&sortBy=isStaff&sortOrder=desc"
      )
    ).toEqual({
      search: "山田",
      page: 2,
      classRoomId: 3,
      sortBy: "isStaff",
      sortOrder: "desc",
      isStaff: "true",
      isLiveActive: "false",
    });
  });

  it("不正な値は安全な既定値へ戻す", () => {
    expect(
      parseStudentListUrl(
        "page=0&classRoomId=-1&sortBy=invalid&sortOrder=sideways&isStaff=invalid&isLiveActive=invalid"
      )
    ).toEqual({
      search: "",
      page: 1,
      classRoomId: null,
      sortBy: null,
      sortOrder: null,
      isStaff: "all",
      isLiveActive: "all",
    });
  });

  it("8種類のsort値を受け付ける", () => {
    for (const sortBy of [
      "studentId",
      "studentIdNumber",
      "displayName",
      "classCode",
      "className",
      "attendanceNumber",
      "isStaff",
      "isLiveActive",
    ] as const) {
      expect(parseStudentListUrl(`sortBy=${sortBy}`).sortBy).toBe(sortBy);
    }
  });

  it("条件変更時にpageを先頭へ戻し、既存の別パラメータを保持する", () => {
    expect(
      updateStudentListUrl("tab=active&page=4&sortBy=studentId&sortOrder=asc", {
        search: "  山田 ",
        classRoomId: 2,
        isStaff: "true",
        isLiveActive: "false",
        page: 1,
      })
    ).toBe(
      "tab=active&sortBy=studentId&sortOrder=asc&search=%E5%B1%B1%E7%94%B0&classRoomId=2&isStaff=true&isLiveActive=false"
    );
  });

  it("allを選択したfilterはURLから削除する", () => {
    expect(
      updateStudentListUrl("isStaff=true&isLiveActive=false", {
        isStaff: "all",
        isLiveActive: "all",
      })
    ).toBe("");
  });
});
