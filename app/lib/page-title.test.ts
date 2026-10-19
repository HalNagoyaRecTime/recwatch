import { describe, expect, it } from "vitest";
import { createPageTitle } from "~/lib/page-title";

describe("createPageTitle", () => {
  it("画面名の後ろにアプリ名を付ける", () => {
    expect(createPageTitle("ダッシュボード")).toBe("ダッシュボード | recwatch");
  });
});
