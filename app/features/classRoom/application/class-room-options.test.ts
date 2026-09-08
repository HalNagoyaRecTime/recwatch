import { describe, expect, it, vi } from "vitest";

import { getClassRoomData } from "~/features/classRoom/application/class-room-options";

describe("getClassRoomData", () => {
  it("候補選択用に全ページを取得する", async () => {
    const getClassRoomList = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            classRoomId: 1,
            classCode: "IH13A",
            className: "高度情報学科",
            studentCount: 2,
            teacher: null,
          },
        ],
        total: 2,
        limit: 100,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [
          {
            classRoomId: 2,
            classCode: "PI12A",
            className: "情報処理学科",
            studentCount: 1,
            teacher: null,
          },
        ],
        total: 2,
        limit: 100,
        offset: 1,
      });

    await expect(getClassRoomData({ getClassRoomList })).resolves.toHaveLength(
      2
    );
    expect(getClassRoomList).toHaveBeenNthCalledWith(1, {
      limit: 100,
      offset: 0,
      sortBy: "classRoomId",
      sortOrder: "asc",
    });
    expect(getClassRoomList).toHaveBeenNthCalledWith(2, {
      limit: 100,
      offset: 1,
      sortBy: "classRoomId",
      sortOrder: "asc",
    });
  });
});
