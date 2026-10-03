import { describe, expect, it } from "vitest";

import {
  calculateSearchFrame,
  getSearchViewport,
  isSameSearchFrame,
} from "~/features/frame/main-header/search/model/search-geometry";

const anchorRect = { top: 12, left: 1080, width: 200, height: 40 };

describe("search geometry", () => {
  it("uses the anchor position for the closed frame", () => {
    expect(
      calculateSearchFrame(
        anchorRect,
        { top: 0, left: 0, width: 1440, height: 900 },
        false
      )
    ).toEqual({ top: 12, left: 1080, width: 200, height: 40 });
  });

  it("centers the desktop frame and caps it at 720px", () => {
    expect(
      calculateSearchFrame(
        anchorRect,
        { top: 0, left: 0, width: 1440, height: 900 },
        true
      )
    ).toEqual({ top: 90, left: 360, width: 720, height: 720 });
  });

  it("keeps the mobile frame inside the VisualViewport with 16px gutters", () => {
    expect(
      calculateSearchFrame(
        { top: 4, left: 300, width: 32, height: 40 },
        { top: 110, left: 0, width: 375, height: 520 },
        true
      )
    ).toEqual({ top: 162, left: 16, width: 343, height: 416 });
  });

  it("uses layout viewport metrics when VisualViewport is unavailable", () => {
    expect(getSearchViewport({ innerWidth: 390, innerHeight: 844 })).toEqual({
      top: 0,
      left: 0,
      width: 390,
      height: 844,
    });
  });

  it("uses VisualViewport offsets and keyboard-reduced dimensions", () => {
    expect(
      getSearchViewport({
        innerWidth: 390,
        innerHeight: 844,
        visualViewport: {
          offsetTop: 240,
          offsetLeft: 2,
          width: 386,
          height: 320,
        },
      })
    ).toEqual({ top: 240, left: 2, width: 386, height: 320 });
  });

  it("ignores subpixel measurement noise but detects real movement", () => {
    expect(isSameSearchFrame(anchorRect, { ...anchorRect, top: 12.25 })).toBe(
      true
    );
    expect(isSameSearchFrame(anchorRect, { ...anchorRect, top: 13 })).toBe(
      false
    );
  });
});
