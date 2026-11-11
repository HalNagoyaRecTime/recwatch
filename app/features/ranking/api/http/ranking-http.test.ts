import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("~/lib/api-client", () => ({
  apiClient: {
    get: mocks.getMock,
  },
}));

import { rankingHttpApi } from "~/features/ranking/api/http/ranking-http";

describe("rankingHttpApi", () => {
  it("一覧条件をAPIクエリへ変換する", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 50,
    });

    await rankingHttpApi.getRankingList({
      limit: 50,
      offset: 50,
      search: "赤組",
    });

    expect(mocks.getMock).toHaveBeenCalledWith(
      `/api/v1/ranking?${new URLSearchParams({
        limit: "50",
        offset: "50",
        search: "赤組",
      }).toString()}`
    );
  });

  it("searchが空文字の場合はクエリへ含めない", async () => {
    mocks.getMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });

    await rankingHttpApi.getRankingList({ limit: 50, offset: 0 });

    expect(mocks.getMock).toHaveBeenCalledWith(
      `/api/v1/ranking?${new URLSearchParams({
        limit: "50",
        offset: "0",
      }).toString()}`
    );
  });
});
