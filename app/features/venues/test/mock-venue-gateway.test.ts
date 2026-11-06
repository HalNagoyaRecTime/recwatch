import { describe, expect, it } from "vitest";

import { createMockVenueGateway } from "~/features/venues/mock/mock-venue-gateway";

const venues = [
  {
    id: 1,
    name: "体育館",
    imageUrl: null,
    createdAt: "2026-09-25T09:00:00Z",
    updatedAt: "2026-09-25T09:00:00Z",
  },
  {
    id: 2,
    name: "グラウンド",
    imageUrl: null,
    createdAt: "2026-09-25T09:01:00Z",
    updatedAt: "2026-09-25T09:01:00Z",
  },
];

describe("createMockVenueGateway", () => {
  it("名称検索とページネーションを再現する", async () => {
    const gateway = createMockVenueGateway(venues);

    await expect(
      gateway.list({ name: "体育", limit: 20, offset: 0 })
    ).resolves.toMatchObject({
      items: [expect.objectContaining({ name: "体育館" })],
      total: 1,
    });
  });

  it("削除後の一覧から対象を除外する", async () => {
    const gateway = createMockVenueGateway(venues);

    await gateway.delete(1);

    await expect(gateway.list()).resolves.toMatchObject({
      items: [expect.objectContaining({ id: 2 })],
      total: 1,
    });
  });

  it("一覧を指定した列と方向でソートする", async () => {
    const gateway = createMockVenueGateway([
      { ...venues[1], id: 1, name: "B会場" },
      { ...venues[0], id: 2, name: "A会場" },
    ]);

    await expect(
      gateway.list({
        limit: 20,
        offset: 0,
        sort: { columnId: "name", direction: "asc" },
      })
    ).resolves.toMatchObject({
      items: [
        expect.objectContaining({ name: "A会場" }),
        expect.objectContaining({ name: "B会場" }),
      ],
    });
  });

  it("ソート未指定時は実APIと同じID昇順にする", async () => {
    const gateway = createMockVenueGateway([venues[1], venues[0]]);

    await expect(gateway.list()).resolves.toMatchObject({
      items: [
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ],
    });
  });

  it("画像の登録と削除を一覧の画像URLに反映する", async () => {
    const gateway = createMockVenueGateway(venues);

    await gateway.setImage(1, new Blob(["image"], { type: "image/jpeg" }));
    const withImage = await gateway.list();
    expect(withImage.items[0].imageUrl).not.toBeNull();

    await gateway.deleteImage(1);
    const withoutImage = await gateway.list();
    expect(withoutImage.items[0].imageUrl).toBeNull();
  });
});
