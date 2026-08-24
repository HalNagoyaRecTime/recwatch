import { describe, expect, it } from "vitest";

import {
  toGatheringSpot,
  toGatheringSpotWriteRequest,
} from "~/features/gathering-spots/api/mappers/gathering-spot-mappers";

describe("集合場所APIマッパー", () => {
  it("APIのsnake_caseを画面モデルへ変換する", () => {
    expect(
      toGatheringSpot({
        gathering_spot_id: 10,
        gathering_spot_name: "体育館前",
        created_at: "2026-08-07T09:00:00Z",
        updated_at: "2026-08-07T09:10:00Z",
      })
    ).toEqual({
      id: 10,
      name: "体育館前",
      createdAt: "2026-08-07T09:00:00Z",
      updatedAt: "2026-08-07T09:10:00Z",
    });
  });

  it("作成・更新名をAPIのcamelCase契約へ変換する", () => {
    expect(toGatheringSpotWriteRequest("  正門前  ")).toEqual({
      gatheringSpotName: "  正門前  ",
    });
  });
});
