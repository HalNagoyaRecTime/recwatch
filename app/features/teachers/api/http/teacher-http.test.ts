import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("~/lib/api-client", () => ({
  apiClient: {
    delete: mocks.deleteMock,
    get: mocks.getMock,
    post: mocks.postMock,
    put: mocks.putMock,
  },
}));

import { teacherHttpApi } from "~/features/teachers/api/http/teacher-http";

describe("teacherHttpApi", () => {
  it("一覧条件をAPIクエリへ変換する", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 50,
    });

    await teacherHttpApi.getTeacherList({
      limit: 50,
      offset: 50,
      search: "佐橋 晴斗",
      sortBy: "displayName",
      sortOrder: "desc",
      classRoomId: 3,
      isStaff: "false",
      isLiveActive: "true",
    });

    expect(mocks.getMock).toHaveBeenCalledWith(
      `/api/v1/teachers?${new URLSearchParams({
        limit: "50",
        offset: "50",
        search: "佐橋 晴斗",
        classRoomId: "3",
        isStaff: "false",
        isLiveActive: "true",
        sortBy: "displayName",
        sortOrder: "desc",
      }).toString()}`
    );
  });

  it("作成・更新・無効化のHTTP契約を保持する", async () => {
    mocks.postMock.mockResolvedValueOnce({});
    mocks.putMock.mockResolvedValueOnce({});
    mocks.deleteMock.mockResolvedValueOnce(undefined);

    await teacherHttpApi.createTeacher({ userName: "新任", classRoomIds: [] });
    await teacherHttpApi.updateTeacher(7, {
      userName: "更新後",
      classRoomIds: [2, 4],
    });
    await teacherHttpApi.deleteTeacher(7);

    expect(mocks.postMock).toHaveBeenCalledWith("/api/v1/teachers", {
      userName: "新任",
      classRoomIds: [],
    });
    expect(mocks.putMock).toHaveBeenCalledWith("/api/v1/teachers/7", {
      userName: "更新後",
      classRoomIds: [2, 4],
    });
    expect(mocks.deleteMock).toHaveBeenCalledWith("/api/v1/teachers/7");
  });
});
