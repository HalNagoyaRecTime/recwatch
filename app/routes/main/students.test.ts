import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentApi } from "~/features/students/api";
import { clientLoader } from "~/routes/main/students";

afterEach(() => vi.restoreAllMocks());

describe("students route clientLoader", () => {
  it("URL条件をStudent APIの一覧queryへ変換し、option APIを呼ばない", async () => {
    const getStudents = vi.spyOn(StudentApi, "getStudents").mockResolvedValue({
      items: [],
      limit: 50,
      offset: 100,
      total: 0,
    });

    await expect(
      clientLoader({
        request: new Request(
          "https://example.test/students?page=3&search=%E5%B1%B1%E7%94%B0&classRoomId=2&isStaff=true&isLiveActive=false&sortBy=displayName&sortOrder=desc"
        ),
      })
    ).resolves.toEqual({ limit: 50, offset: 100, students: [], total: 0 });

    expect(getStudents).toHaveBeenCalledWith({
      limit: 50,
      offset: 100,
      search: "山田",
      classRoomId: 2,
      isStaff: "true",
      isLiveActive: "false",
      sortBy: "displayName",
      sortOrder: "desc",
    });
  });
});
