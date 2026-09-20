import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTeacherList: vi.fn(),
  getClassRoomData: vi.fn(),
}));

vi.mock("~/features/teachers/api", () => ({
  TeacherApi: {
    getTeacherList: mocks.getTeacherList,
  },
}));

vi.mock("~/features/classRoom/model/classRoom-data", () => ({
  getClassRoomData: mocks.getClassRoomData,
}));

import { clientLoader } from "~/routes/main/teachers";

describe("teachers route clientLoader", () => {
  beforeEach(() => {
    mocks.getTeacherList.mockReset();
    mocks.getClassRoomData.mockReset();
    mocks.getTeacherList.mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 100,
    });
    mocks.getClassRoomData.mockResolvedValue([]);
  });

  it("URL QueryをTeacher APIの一覧条件へ渡す", async () => {
    await clientLoader({
      request: new Request(
        "https://example.test/teachers?page=3&search=%E4%BD%90%E6%A9%8B+%E6%99%B4%E6%96%97&classRoomId=3&isStaff=false&isLiveActive=all&sortBy=className&sortOrder=desc"
      ),
    });

    expect(mocks.getTeacherList).toHaveBeenCalledWith({
      limit: 50,
      offset: 100,
      search: "佐橋 晴斗",
      classRoomId: 3,
      sortBy: "className",
      sortOrder: "desc",
      isStaff: "false",
      isLiveActive: "all",
    });
  });
});
