import { describe, expect, it } from "vitest";

import { toClassRoomData } from "~/features/classRoom/model/classRoom";

describe("toClassRoomData", () => {
  it("APIレスポンスを画面用のデータへ変換する", () => {
    expect(
      toClassRoomData({
        class_room_id: 1,
        class_code: "IH12A203",
        class_name: "情報処理学科1年A組",
        student_count: 32,
      })
    ).toEqual({
      ClassRoomId: 1,
      ClassRoomCode: "IH12A203",
      ClassRoomName: "情報処理学科1年A組",
      StudentCount: 32,
    });
  });

  it("クラスIDを保持する", () => {
    expect(
      toClassRoomData({
        class_room_id: 2,
        class_code: "PI12A203",
        class_name: "高度情報学科1年A組",
        student_count: 25,
      }).ClassRoomId
    ).toBe(2);
  });
});
