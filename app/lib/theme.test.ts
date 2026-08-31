import { beforeEach, describe, expect, it } from "vitest";

import { applyTheme } from "./theme";

describe("applyTheme", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.className = "";
    root.removeAttribute("data-theme");
    root.style.removeProperty("color-scheme");
  });

  it("ダークモードではブラウザ標準部品もダーク配色にする", () => {
    applyTheme("dark");

    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("ライトモードへ戻すとブラウザ標準部品もライト配色に戻す", () => {
    applyTheme("light");

    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
