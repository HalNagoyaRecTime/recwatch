import { describe, expect, it } from "vitest";

import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { filterClassRooms } from "~/features/classRoom/model/classRoom-search";

const classRooms: ClassRoomData[] = [
  {
    classRoomId: 1,
    classRoomCode: "IH12A203",
    classRoomName: "情報処理学科1年A組",
    studentCount: 32,
    teacherId: 10,
    teacherName: "佐橋 晴斗",
  },
  {
    classRoomId: 2,
    classRoomCode: "PI12A203",
    classRoomName: "高度情報学科1年A組",
    studentCount: 25,
    teacherId: null,
    teacherName: null,
  },
];

describe("filterClassRooms", () => {
  it("クラス記号・クラス名・教官名を対象に検索する", () => {
    expect(filterClassRooms(classRooms, "IH12A")).toEqual([classRooms[0]]);
    expect(filterClassRooms(classRooms, "高度情報")).toEqual([classRooms[1]]);
    expect(filterClassRooms(classRooms, "佐橋")).toEqual([classRooms[0]]);
  });

  it("前後の空白と全角英数字を正規化する", () => {
    expect(filterClassRooms(classRooms, "  ＰＩ１２Ａ  ")).toEqual([
      classRooms[1],
    ]);
  });

  it("空白だけの検索では全件を返す", () => {
    expect(filterClassRooms(classRooms, "  ")).toEqual(classRooms);
  });
});
