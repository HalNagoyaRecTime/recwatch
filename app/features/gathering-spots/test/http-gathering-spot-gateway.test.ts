import { describe, expect, it, vi } from "vitest";

import { createHttpGatheringSpotGateway } from "~/features/gathering-spots/api/http/http-gathering-spot-gateway";

function createResponse(id = 10, name = "体育館前") {
  return {
    gathering_spot_id: id,
    gathering_spot_name: name,
    created_at: "2026-08-07T09:00:00Z",
    updated_at: "2026-08-07T09:10:00Z",
  };
}

function createClient(overrides: Record<string, unknown> = {}) {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as {
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    put<T>(path: string, body: unknown): Promise<T>;
    delete(path: string): Promise<void>;
  };
}

describe("createHttpGatheringSpotGateway", () => {
  it("検索・ページネーション付き一覧を取得する", async () => {
    const get = vi.fn().mockResolvedValue({
      gathering_spots: [createResponse()],
      total: 21,
      limit: 20,
      offset: 0,
    });
    const gateway = createHttpGatheringSpotGateway(createClient({ get }));

    await expect(
      gateway.list({ name: "体育館", limit: 20, offset: 0 })
    ).resolves.toMatchObject({
      items: [{ id: 10, name: "体育館前" }],
      total: 21,
      limit: 20,
      offset: 0,
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/gathering-spots?limit=20&offset=0&name=%E4%BD%93%E8%82%B2%E9%A4%A8"
    );
  });

  it("内部の並び替え条件をAPIのクエリ形式へ変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      gathering_spots: [],
      total: 0,
      limit: 20,
      offset: 0,
    });
    const gateway = createHttpGatheringSpotGateway(createClient({ get }));

    await gateway.list({
      limit: 20,
      offset: 40,
      sort: { columnId: "created-at", direction: "desc" },
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v1/gathering-spots?limit=20&offset=40&sortBy=createdAt&sortOrder=desc"
    );
  });

  it("クエリなしの従来配列レスポンスを一覧ページへ正規化する", async () => {
    const get = vi.fn().mockResolvedValue([createResponse()]);
    const gateway = createHttpGatheringSpotGateway(createClient({ get }));

    await expect(gateway.list()).resolves.toMatchObject({
      items: [{ id: 10 }],
      total: 1,
      limit: 1,
      offset: 0,
    });
    expect(get).toHaveBeenCalledWith("/api/v1/gathering-spots");
  });

  it("詳細取得と削除をID付きAPIへ委譲する", async () => {
    const get = vi.fn().mockResolvedValue(createResponse(10, "正門前"));
    const deleteRequest = vi.fn().mockResolvedValue(undefined);
    const gateway = createHttpGatheringSpotGateway(
      createClient({ get, delete: deleteRequest })
    );

    await expect(gateway.getById(10)).resolves.toMatchObject({
      id: 10,
      name: "正門前",
    });
    await expect(gateway.delete(10)).resolves.toBeUndefined();
    expect(get).toHaveBeenCalledWith("/api/v1/gathering-spots/10");
    expect(deleteRequest).toHaveBeenCalledWith("/api/v1/gathering-spots/10");
  });

  it("作成と更新をAPI契約へ委譲して画面モデルへ変換する", async () => {
    const post = vi.fn().mockResolvedValue(createResponse(11, "正門前"));
    const put = vi.fn().mockResolvedValue(createResponse(11, "体育館入口"));
    const gateway = createHttpGatheringSpotGateway(createClient({ post, put }));

    await expect(gateway.create("正門前")).resolves.toMatchObject({
      id: 11,
      name: "正門前",
    });
    await expect(gateway.update(11, "体育館入口")).resolves.toMatchObject({
      id: 11,
      name: "体育館入口",
    });
    expect(post).toHaveBeenCalledWith("/api/v1/gathering-spots", {
      gatheringSpotName: "正門前",
    });
    expect(put).toHaveBeenCalledWith("/api/v1/gathering-spots/11", {
      gatheringSpotName: "体育館入口",
    });
  });
});
