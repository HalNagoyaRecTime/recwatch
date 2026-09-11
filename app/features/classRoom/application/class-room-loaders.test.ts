import { describe, expect, it, vi } from "vitest";

import { loadClassRoomListPage } from "~/features/classRoom/application/class-room-loaders";
import type { ClassRoomManagementApi } from "~/features/classRoom/api/contracts/class-room-api";

describe("loadClassRoomListPage", () => {
  it("受け取ったAPI契約へ一覧Queryを委譲する", async () => {
    const page = { items: [], total: 0, limit: 50, offset: 0 };
    const api = {
      getClassRoomList: vi.fn().mockResolvedValue(page),
    } as unknown as ClassRoomManagementApi;
    const query = { limit: 50, offset: 0, search: "1A" };

    await expect(loadClassRoomListPage(api, query)).resolves.toBe(page);
    expect(api.getClassRoomList).toHaveBeenCalledWith(query);
  });
});
