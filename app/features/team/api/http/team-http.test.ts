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

import { teamHttpApi } from "~/features/team/api/http/team-http";

describe("teamHttpApi", () => {
  it("一覧条件をAPIクエリへ変換する", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 50,
    });

    await teamHttpApi.getTeamList({
      limit: 50,
      offset: 50,
      search: "赤組",
      sortBy: "teamName",
      sortOrder: "desc",
    });

    expect(mocks.getMock).toHaveBeenCalledWith(
      `/api/v1/teams?${new URLSearchParams({
        limit: "50",
        offset: "50",
        search: "赤組",
        sortBy: "teamName",
        sortOrder: "desc",
      }).toString()}`
    );
  });

  it("作成・更新・削除・得点加算のHTTP契約を保持する", async () => {
    mocks.postMock.mockResolvedValueOnce({});
    mocks.putMock.mockResolvedValueOnce({});
    mocks.deleteMock.mockResolvedValueOnce(undefined);
    mocks.patchMock.mockResolvedValueOnce({});

    await teamHttpApi.createTeam({ teamName: "新設", classCodes: ["1A"] });
    await teamHttpApi.updateTeam(7, {
      teamName: "更新後",
      classCodes: ["1A", "1B"],
    });
    await teamHttpApi.deleteTeam(7);
    await teamHttpApi.addTeamScore(7, { points: -10 });

    expect(mocks.postMock).toHaveBeenCalledWith("/api/v1/teams", {
      team_name: "新設",
      class_codes: ["1A"],
    });
    expect(mocks.putMock).toHaveBeenCalledWith("/api/v1/teams/7", {
      team_name: "更新後",
      class_codes: ["1A", "1B"],
    });
    expect(mocks.deleteMock).toHaveBeenCalledWith("/api/v1/teams/7");
    expect(mocks.patchMock).toHaveBeenCalledWith("/api/v1/teams/7/score", {
      points: -10,
    });
  });
});
