import { describe, expect, it } from "vitest";

import {
  getNextGatheringSpotSort,
  isGatheringSpotSortableColumnId,
} from "~/features/gathering-spots/model/gathering-spot";

describe("集合場所一覧のソートモデル", () => {
  it("同じ列を続けて選択すると昇順から降順へ切り替わる", () => {
    const first = getNextGatheringSpotSort(undefined, "name");
    const second = getNextGatheringSpotSort(first, "name");

    expect(first).toEqual({ columnId: "name", direction: "asc" });
    expect(second).toEqual({ columnId: "name", direction: "desc" });
  });

  it("一覧でソート可能な列だけを受け付ける", () => {
    expect(isGatheringSpotSortableColumnId("created-at")).toBe(true);
    expect(isGatheringSpotSortableColumnId("actions")).toBe(false);
  });
});
