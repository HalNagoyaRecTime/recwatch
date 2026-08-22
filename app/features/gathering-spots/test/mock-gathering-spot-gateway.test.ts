import { describe, expect, it } from "vitest";

import { createMockGatheringSpotGateway } from "~/features/gathering-spots/mock/mock-gathering-spot-gateway";

const spots = [
  {
    id: 1,
    name: "体育館前",
    createdAt: "2026-08-07T09:00:00Z",
    updatedAt: "2026-08-07T09:00:00Z",
  },
  {
    id: 2,
    name: "正門前",
    createdAt: "2026-08-07T09:01:00Z",
    updatedAt: "2026-08-07T09:01:00Z",
  },
];

describe("createMockGatheringSpotGateway", () => {
  it("名称検索とページネーションを再現する", async () => {
    const gateway = createMockGatheringSpotGateway(spots);

    await expect(
      gateway.list({ name: "体育", limit: 20, offset: 0 })
    ).resolves.toMatchObject({
      items: [expect.objectContaining({ name: "体育館前" })],
      total: 1,
    });
  });

  it("削除後の一覧から対象を除外する", async () => {
    const gateway = createMockGatheringSpotGateway(spots);

    await gateway.delete(1);

    await expect(gateway.list()).resolves.toMatchObject({
      items: [expect.objectContaining({ id: 2 })],
      total: 1,
    });
  });

  it("一覧を指定した列と方向でソートする", async () => {
    const gateway = createMockGatheringSpotGateway([
      { ...spots[1], id: 1, name: "B会場" },
      { ...spots[0], id: 2, name: "A会場" },
    ]);

    await expect(
      gateway.list({
        limit: 20,
        offset: 0,
        sortBy: "name",
        sortOrder: "asc",
      })
    ).resolves.toMatchObject({
      items: [
        expect.objectContaining({ name: "A会場" }),
        expect.objectContaining({ name: "B会場" }),
      ],
    });
  });
});
