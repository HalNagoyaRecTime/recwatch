import { describe, expect, it } from "vitest";

import {
  getNextVenueSort,
  isVenueSortableColumnId,
} from "~/features/venues/model/venue";

describe("実施場所一覧のソートモデル", () => {
  it("同じ列を続けて選択すると昇順から降順へ切り替わる", () => {
    const first = getNextVenueSort(undefined, "name");
    const second = getNextVenueSort(first, "name");

    expect(first).toEqual({ columnId: "name", direction: "asc" });
    expect(second).toEqual({ columnId: "name", direction: "desc" });
  });

  it("一覧でソート可能な列だけを受け付ける", () => {
    expect(isVenueSortableColumnId("created-at")).toBe(true);
    expect(isVenueSortableColumnId("actions")).toBe(false);
  });
});
