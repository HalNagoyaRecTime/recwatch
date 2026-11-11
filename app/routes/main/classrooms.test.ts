import { afterEach, describe, expect, it, vi } from "vitest";

import { ClassRoomApi } from "~/features/classRoom/api";
import { TeacherApi } from "~/features/teachers/api";
import { clientLoader } from "~/routes/main/classrooms";

afterEach(() => vi.restoreAllMocks());

describe("classrooms route clientLoader", () => {
  it("URL条件をClassRoom APIへ変換し、teacher option APIを呼ばない", async () => {
    const getClassRoomList = vi
      .spyOn(ClassRoomApi, "getClassRoomList")
      .mockResolvedValue({
        items: [],
        limit: 50,
        offset: 100,
        total: 0,
      });
    const getActiveTeachers = vi.spyOn(TeacherApi, "getActiveTeachers");

    await expect(
      clientLoader({
        request: new Request(
          "https://example.test/classrooms?page=3&search=%E4%B8%80%E5%B9%B4&sortBy=className&sortOrder=desc"
        ),
      })
    ).resolves.toEqual({ items: [], limit: 50, offset: 100, total: 0 });

    expect(getClassRoomList).toHaveBeenCalledWith({
      limit: 50,
      offset: 100,
      search: "一年",
      sortBy: "className",
      sortOrder: "desc",
    });
    expect(getActiveTeachers).not.toHaveBeenCalled();
  });
});
