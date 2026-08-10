import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";

const firstClassRoom = {
  class_room_id: 1,
  class_code: "IH12A203",
  class_name: "情報処理学科1年A組",
  student_count: 32,
};

const secondClassRoom = {
  class_room_id: 2,
  class_code: "PI12A203",
  class_name: "高度情報学科1年A組",
  student_count: 25,
};

describe("getClassRoomData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("全ページを取得して画面用データへ変換する", async () => {
    const getAllClassRooms = vi
      .spyOn(ClassRoomApi, "getAllClassRooms")
      .mockResolvedValue([firstClassRoom, secondClassRoom]);

    await expect(getClassRoomData()).resolves.toEqual([
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
    ]);
    expect(getAllClassRooms).toHaveBeenCalledTimes(1);
  });

  it("空の一覧を返す", async () => {
    const getAllClassRooms = vi
      .spyOn(ClassRoomApi, "getAllClassRooms")
      .mockResolvedValue([]);

    await expect(getClassRoomData()).resolves.toEqual([]);
    expect(getAllClassRooms).toHaveBeenCalledTimes(1);
  });
});
