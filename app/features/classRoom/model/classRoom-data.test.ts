import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import { getClassRoomData } from "~/features/classRoom/model/classRoom-data";

const firstClassRoom = {
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

const secondClassRoom = {
  class_room_id: 2,
  class_code: "PI12A203",
  class_name: "高度情報学科1年A組",
  student_count: 25,
  teacher: null,
};

describe("getClassRoomData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("全ページを取得して画面用データへ変換する", async () => {
    const getClassRooms = vi
      .spyOn(ClassRoomApi, "getClassRooms")
      .mockResolvedValueOnce({
        classrooms: [firstClassRoom],
        total: 2,
        limit: 1,
        offset: 0,
      })
      .mockResolvedValueOnce({
        classrooms: [secondClassRoom],
        total: 2,
        limit: 1,
        offset: 1,
      });

    await expect(getClassRoomData()).resolves.toEqual([
      {
        classRoomId: 1,
        classRoomCode: "IH12A203",
        classRoomName: "情報処理学科1年A組",
        studentCount: 32,
        teacherName: "佐橋 晴斗",
      },
      {
        classRoomId: 2,
        classRoomCode: "PI12A203",
        classRoomName: "高度情報学科1年A組",
        studentCount: 25,
        teacherName: null,
      },
    ]);
    expect(getClassRooms).toHaveBeenNthCalledWith(1, 0);
    expect(getClassRooms).toHaveBeenNthCalledWith(2, 1);
  });

  it("空のページが返った場合は追加取得を終了する", async () => {
    const getClassRooms = vi
      .spyOn(ClassRoomApi, "getClassRooms")
      .mockResolvedValue({
        classrooms: [],
        total: 1,
        limit: 100,
        offset: 0,
      });

    await expect(getClassRoomData()).resolves.toEqual([]);
    expect(getClassRooms).toHaveBeenCalledTimes(1);
  });

  it("ページ形式でないレスポンスをエラーにする", async () => {
    vi.spyOn(ClassRoomApi, "getClassRooms").mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof ClassRoomApi.getClassRooms>>
    );

    await expect(getClassRoomData()).rejects.toThrow(
      "予期しない形式のレスポンス"
    );
  });
});
