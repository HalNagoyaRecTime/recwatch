import { describe, expect, it } from "vitest";

import type { classRoomData } from "~/features/classRoom/model/classRoom";
import { filterClassRooms } from "~/features/classRoom/model/classRoom-search";

const classRooms: classRoomData[] = [
  {
    ClassRoomId: 1,
    ClassRoomCode: "IH12A203",
    ClassRoomName: "情報処理学科1年A組",
    StudentCount: 32,
  },
  {
    ClassRoomId: 2,
    ClassRoomCode: "PI12A203",
    ClassRoomName: "高度情報学科1年A組",
    StudentCount: 25,
  },
];

describe("filterClassRooms", () => {
  it("クラス記号・クラス名を対象に検索する", () => {
    expect(filterClassRooms(classRooms, "IH12A")).toEqual([classRooms[0]]);
    expect(filterClassRooms(classRooms, "高度情報")).toEqual([classRooms[1]]);
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
