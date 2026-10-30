import { describe, expect, it } from "vitest";

import { fitWithin } from "./resize-image";

describe("fitWithin", () => {
  it("長い辺が上限を超える横長の画像は、縦横比を保って上限に収める", () => {
    expect(fitWithin(4032, 3024, 1920)).toEqual({ width: 1920, height: 1440 });
  });

  it("長い辺が上限を超える縦長の画像は、縦横比を保って上限に収める", () => {
    expect(fitWithin(3024, 4032, 1920)).toEqual({ width: 1440, height: 1920 });
  });

  it("極端に細長い画像でも、短い辺を 0px にしない", () => {
    expect(fitWithin(1, 10000, 1920)).toEqual({ width: 1, height: 1920 });
  });

  it("上限以下の画像は拡大しない", () => {
    expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600 });
  });
});
