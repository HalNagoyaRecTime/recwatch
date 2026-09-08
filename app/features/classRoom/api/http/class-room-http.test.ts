import { describe, expect, it, vi } from "vitest";

import { createClassRoomHttpApi } from "~/features/classRoom/api/http/class-room-http";

const classRoom = {
  class_room_id: 3,
  class_code: "IH13A",
  class_name: "高度情報学科",
  student_count: 12,
  teacher: null,
};

describe("ClassRoom HTTP API", () => {
  it("一覧QueryをAPIのsearch/sort/paginationへ変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      items: [classRoom],
      total: 51,
      limit: 50,
      offset: 50,
    });
    const api = createClassRoomHttpApi({
      get,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    });

    await expect(
      api.getClassRoomList({
        limit: 50,
        offset: 50,
        search: "  ＩＨ１３Ａ  ",
        sortBy: "teacherName",
        sortOrder: "desc",
      })
    ).resolves.toMatchObject({
      items: [
        expect.objectContaining({
          classRoomId: 3,
          classCode: "IH13A",
          className: "高度情報学科",
          teacher: null,
        }),
      ],
      total: 51,
      limit: 50,
      offset: 50,
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/classrooms?limit=50&offset=50&search=%EF%BC%A9%EF%BC%A8%EF%BC%91%EF%BC%93%EF%BC%A1&sortBy=teacherName&sortOrder=desc"
    );
  });

  it("作成・更新はcamelCaseの入力だけを送る", async () => {
    const post = vi.fn().mockResolvedValue(classRoom);
    const put = vi.fn().mockResolvedValue(classRoom);
    const api = createClassRoomHttpApi({
      get: vi.fn(),
      post,
      put,
      delete: vi.fn(),
    });
    const input = {
      classCode: "IH13A",
      className: "高度情報学科",
      teacherId: null,
    };

    await api.createClassRoom(input);
    await api.updateClassRoom(3, input);

    expect(post).toHaveBeenCalledWith("/api/v1/classrooms", input);
    expect(put).toHaveBeenCalledWith("/api/v1/classrooms/3", input);
  });
});
