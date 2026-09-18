import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  getMock: vi.fn(),
  patchMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("~/lib/api-client", () => ({
  apiClient: {
    delete: mocks.deleteMock,
    get: mocks.getMock,
    patch: mocks.patchMock,
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

  it("一覧条件未指定時はactive=trueを既定値にする", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });

    await teacherHttpApi.getTeacherList();

    expect(mocks.getMock).toHaveBeenCalledWith(
      "/api/v1/teachers?limit=50&offset=0&isStaff=all&isLiveActive=true&sortBy=teacherId&sortOrder=asc"
    );
  });

  it("staff・activeソートをAPIクエリへ渡す", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });

    await teacherHttpApi.getTeacherList({
      sortBy: "isStaff",
      sortOrder: "desc",
    });

    expect(mocks.getMock).toHaveBeenCalledWith(
      "/api/v1/teachers?limit=50&offset=0&isStaff=all&isLiveActive=true&sortBy=isStaff&sortOrder=desc"
    );
  });

  it("作成・更新のHTTP契約を保持する", async () => {
    mocks.postMock.mockResolvedValueOnce({});
    mocks.putMock.mockResolvedValueOnce({});

    await teacherHttpApi.createTeacher({
      email: "new@example.com",
      userName: "新任",
      classRoomIds: [],
    });
    await teacherHttpApi.updateTeacher(7, {
      email: "updated@example.com",
      userName: "更新後",
      classRoomIds: [2, 4],
    });

    expect(mocks.postMock).toHaveBeenCalledWith("/api/v1/teachers", {
      email: "new@example.com",
      userName: "新任",
      classRoomIds: [],
    });
    expect(mocks.putMock).toHaveBeenCalledWith("/api/v1/teachers/7", {
      email: "updated@example.com",
      userName: "更新後",
      classRoomIds: [2, 4],
    });
  });

  it("有効状態とstaff権限をuserId向け専用APIへ送る", async () => {
    mocks.patchMock.mockResolvedValueOnce({
      user_id: 11,
      is_live_active: false,
    });
    mocks.putMock.mockResolvedValueOnce(undefined);
    mocks.deleteMock.mockResolvedValueOnce(undefined);

    await teacherHttpApi.updateUserStatus(11, { is_live_active: false });
    await teacherHttpApi.assignStaff(11);
    await teacherHttpApi.revokeStaff(11);

    expect(mocks.patchMock).toHaveBeenCalledWith("/api/v1/admin/users/11", {
      is_live_active: false,
    });
    expect(mocks.putMock).toHaveBeenCalledWith("/api/v1/admin/users/11/staff");
    expect(mocks.deleteMock).toHaveBeenCalledWith(
      "/api/v1/admin/users/11/staff"
    );
  });
});
