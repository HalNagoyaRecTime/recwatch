import { describe, expect, it } from "vitest";

import {
  teacherCreateTarget,
  teacherEditTarget,
  teacherListTarget,
} from "~/features/teachers/application/teacher-navigation";

describe("teacher navigation targets", () => {
  it("一覧・作成・編集で一覧URLの検索状態を引き継ぐ", () => {
    const search = "?search=%E4%BD%90%E6%A9%8B&page=2";

    expect(teacherListTarget(search)).toEqual({
      pathname: "/teachers",
      search,
    });
    expect(teacherCreateTarget(search)).toEqual({
      pathname: "/teachers/new",
      search,
    });
    expect(teacherEditTarget(7, search)).toEqual({
      pathname: "/teachers/7/edit",
      search,
    });
  });
});
