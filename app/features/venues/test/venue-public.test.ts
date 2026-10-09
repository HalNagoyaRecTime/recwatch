import { describe, expect, it, vi } from "vitest";

import { createHttpVenueReader } from "~/features/venues/api/http/http-venue-reader";

describe("VenueReader", () => {
  it("paginationを全ページ取得してOptionへ変換する", async () => {
    const get = vi.fn(async (path: string) => {
      if (path.endsWith("offset=0")) {
        return {
          venues: [
            {
              venue_id: 1,
              venue_name: "運動場",
              created_at: "",
              updated_at: "",
            },
          ],
          total: 2,
        };
      }
      return {
        venues: [
          {
            venue_id: 2,
            venue_name: "体育館",
            created_at: "",
            updated_at: "",
          },
        ],
        total: 2,
      };
    });

    await expect(createHttpVenueReader({ get }).listAll()).resolves.toEqual([
      { id: 1, name: "運動場" },
      { id: 2, name: "体育館" },
    ]);
    expect(get).toHaveBeenCalledTimes(2);
  });
});
