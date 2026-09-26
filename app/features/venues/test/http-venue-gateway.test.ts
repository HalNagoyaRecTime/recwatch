import { describe, expect, it, vi } from "vitest";

import { createHttpVenueGateway } from "~/features/venues/api/http/http-venue-gateway";

function createResponse(id = 10, name = "体育館") {
  return {
    venue_id: id,
    venue_name: name,
    created_at: "2026-09-25T09:00:00Z",
    updated_at: "2026-09-25T09:10:00Z",
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

describe("createHttpVenueGateway", () => {
  it("検索・ページネーション付き一覧を取得する", async () => {
    const get = vi.fn().mockResolvedValue({
      venues: [createResponse()],
      total: 21,
      limit: 20,
      offset: 0,
    });
    const gateway = createHttpVenueGateway(createClient({ get }));

    await expect(
      gateway.list({ name: "体育", limit: 20, offset: 0 })
    ).resolves.toMatchObject({
      items: [{ id: 10, name: "体育館" }],
      total: 21,
      limit: 20,
      offset: 0,
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/venues?limit=20&offset=0&name=%E4%BD%93%E8%82%B2"
    );
  });

  it("内部の並び替え条件をAPIのクエリ形式へ変換する", async () => {
    const get = vi.fn().mockResolvedValue({
      venues: [],
      total: 0,
      limit: 20,
      offset: 0,
    });
    const gateway = createHttpVenueGateway(createClient({ get }));

    await gateway.list({
      limit: 20,
      offset: 40,
      sort: { columnId: "updated-at", direction: "desc" },
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v1/venues?limit=20&offset=40&sortBy=updatedAt&sortOrder=desc"
    );
  });

  it("クエリなしの配列レスポンスを一覧ページへ正規化する", async () => {
    const get = vi.fn().mockResolvedValue([createResponse()]);
    const gateway = createHttpVenueGateway(createClient({ get }));

    await expect(gateway.list()).resolves.toMatchObject({
      items: [{ id: 10 }],
      total: 1,
      limit: 1,
      offset: 0,
    });
    expect(get).toHaveBeenCalledWith("/api/v1/venues");
  });

  it("作成と更新をAPI契約へ委譲して画面モデルへ変換する", async () => {
    const post = vi.fn().mockResolvedValue(createResponse(11, "グラウンド"));
    const put = vi.fn().mockResolvedValue(createResponse(11, "第2グラウンド"));
    const gateway = createHttpVenueGateway(createClient({ post, put }));

    await expect(gateway.create("グラウンド")).resolves.toMatchObject({
      id: 11,
      name: "グラウンド",
    });
    await expect(gateway.update(11, "第2グラウンド")).resolves.toMatchObject({
      id: 11,
      name: "第2グラウンド",
    });
    expect(post).toHaveBeenCalledWith("/api/v1/venues", {
      venueName: "グラウンド",
    });
    expect(put).toHaveBeenCalledWith("/api/v1/venues/11", {
      venueName: "第2グラウンド",
    });
  });

  it("削除をID付きAPIへ委譲する", async () => {
    const deleteRequest = vi.fn().mockResolvedValue(undefined);
    const gateway = createHttpVenueGateway(
      createClient({ delete: deleteRequest })
    );

    await expect(gateway.delete(10)).resolves.toBeUndefined();
    expect(deleteRequest).toHaveBeenCalledWith("/api/v1/venues/10");
  });
});
