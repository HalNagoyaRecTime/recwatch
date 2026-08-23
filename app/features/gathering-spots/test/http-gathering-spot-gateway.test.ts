import { describe, expect, it, vi } from "vitest";

import { createHttpGatheringSpotGateway } from "~/features/gathering-spots/api/http/http-gathering-spot-gateway";

describe("createHttpGatheringSpotGateway", () => {
  it("内部の並び替え条件をAPIのクエリ形式へ変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      gathering_spots: [],
      total: 0,
      limit: 20,
      offset: 0,
    });
    const gateway = createHttpGatheringSpotGateway({
      get,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    });

    await gateway.list({
      limit: 20,
      offset: 40,
      sort: { columnId: "created-at", direction: "desc" },
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v1/gathering-spots?limit=20&offset=40&sortBy=createdAt&sortOrder=desc"
    );
  });
});
