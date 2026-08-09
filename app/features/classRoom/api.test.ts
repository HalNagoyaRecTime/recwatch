import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
vi.mock("~/lib/api-client", () => ({
  apiClient: { get: (...args: unknown[]) => getMock(...args) },
}));

import { ClassRoomApi, type classRoomDTO, type classRoomPageDTO } from "./api";

function makeClassRoom(id: number): classRoomDTO {
  return {
    class_room_id: id,
    class_code: `C${id}`,
    class_name: `クラス${id}`,
    student_count: 0,
  };
}

describe("ClassRoomApi.getAllClassRooms", () => {
  it("101件目以降もoffsetを進めながら全ページ取得する", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => makeClassRoom(i + 1));
    const page2 = [makeClassRoom(101)];
    getMock
      .mockResolvedValueOnce({
        classrooms: page1,
        total: 101,
        limit: 100,
        offset: 0,
      } satisfies classRoomPageDTO)
      .mockResolvedValueOnce({
        classrooms: page2,
        total: 101,
        limit: 100,
        offset: 100,
      } satisfies classRoomPageDTO);

    const result = await ClassRoomApi.getAllClassRooms();

    expect(result).toHaveLength(101);
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/classrooms?limit=100&offset=100"
    );
  });
});
