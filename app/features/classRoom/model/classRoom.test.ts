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
        teacher: {
          teacher_id: 2,
          user_id: 10,
          display_name: "佐橋 晴斗",
        },
      })
    ).toEqual({
      classRoomId: 1,
      classRoomCode: "IH12A203",
      classRoomName: "情報処理学科1年A組",
      studentCount: 32,
      teacherId: 2,
      teacherName: "佐橋 晴斗",
    });
  });

  it("担任が未設定の場合はnullを保持する", () => {
    expect(
      toClassRoomData({
        class_room_id: 2,
        class_code: "PI12A203",
        class_name: "高度情報学科1年A組",
        student_count: 25,
        teacher: null,
      }).teacherName
    ).toBeNull();
  });
});
