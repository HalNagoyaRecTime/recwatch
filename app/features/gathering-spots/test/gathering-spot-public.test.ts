import { describe, expect, it, vi } from "vitest";

import { createHttpGatheringSpotReader } from "~/features/gathering-spots/api/http/http-gathering-spot-reader";

describe("GatheringSpotReader", () => {
  it("paginationを全ページ取得してOptionへ変換する", async () => {
    const get = vi.fn(async (path: string) => {
      if (path.endsWith("offset=0")) {
        return {
          gathering_spots: [
            {
              gathering_spot_id: 1,
              gathering_spot_name: "出入口①",
              created_at: "",
              updated_at: "",
            },
          ],
          total: 2,
        };
      }
      return {
        gathering_spots: [
          {
            gathering_spot_id: 2,
            gathering_spot_name: "出入口②",
            created_at: "",
            updated_at: "",
          },
        ],
        total: 2,
      };
    });

    await expect(
      createHttpGatheringSpotReader({ get }).listAll()
    ).resolves.toEqual([
      { id: 1, name: "出入口①" },
      { id: 2, name: "出入口②" },
    ]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});
