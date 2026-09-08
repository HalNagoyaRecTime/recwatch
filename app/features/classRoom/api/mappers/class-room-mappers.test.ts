import { describe, expect, it } from "vitest";

import {
  toClassRoom,
  toClassRoomPage,
} from "~/features/classRoom/api/mappers/class-room-mappers";

const dto = {
  class_room_id: 1,
  class_code: "IH12A203",
  class_name: "情報処理学科1年A組",
  student_count: 32,
  teacher: {
    teacher_id: 2,
    user_id: 10,
    display_name: "佐橋 晴斗",
  },
};

describe("ClassRoom API mappers", () => {
  it("APIレスポンスをcamelCaseのモデルへ変換する", () => {
    expect(toClassRoom(dto)).toEqual({
      classRoomId: 1,
      classCode: "IH12A203",
      className: "情報処理学科1年A組",
      studentCount: 32,
      teacher: {
        teacherId: 2,
        userId: 10,
        displayName: "佐橋 晴斗",
      },
    });
  });

  it("担当教官が未設定の場合はnullを保持する", () => {
    expect(toClassRoom({ ...dto, teacher: null }).teacher).toBeNull();
  });

  it("items形式と旧classrooms形式のページを受け付ける", () => {
    expect(
      toClassRoomPage({
        items: [dto],
        total: 1,
        limit: 50,
        offset: 0,
      }).items
    ).toHaveLength(1);
    expect(
      toClassRoomPage({
        classrooms: [dto],
        total: 1,
        limit: 50,
        offset: 0,
      }).items
    ).toHaveLength(1);
  });

  it("ページの形式が不正ならエラーにする", () => {
    expect(() =>
      toClassRoomPage({
        items: [],
        total: -1,
        limit: 50,
        offset: 0,
      })
    ).toThrow("クラス一覧APIのレスポンス形式が不正です。");
  });
});
