import { describe, expect, it } from "vitest";

import {
  toVenue,
  toVenueWriteRequest,
} from "~/features/venues/api/mappers/venue-mappers";

describe("実施場所APIマッパー", () => {
  it("APIのsnake_caseを画面モデルへ変換する", () => {
    expect(
      toVenue({
        venue_id: 10,
        venue_name: "体育館",
        created_at: "2026-09-25T09:00:00Z",
        updated_at: "2026-09-25T09:10:00Z",
      })
    ).toEqual({
      id: 10,
      name: "体育館",
      createdAt: "2026-09-25T09:00:00Z",
      updatedAt: "2026-09-25T09:10:00Z",
    });
  });

  it("作成・更新名をAPIのcamelCase契約へ変換する", () => {
    expect(toVenueWriteRequest("  グラウンド  ")).toEqual({
      venueName: "  グラウンド  ",
    });
  });
});
