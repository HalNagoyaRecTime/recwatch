import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appCss = readFileSync(resolve(process.cwd(), "app/app.css"), "utf8");

describe("HydrateFallbackのviewport CSS契約", () => {
  it("account-deletionでも100vh fallbackの後に100dvhを適用する", () => {
    const fallbackIndex = appCss.indexOf(
      'html[data-app-surface="account-deletion"] .root-hydrate-fallback {'
    );
    const dynamicViewportMatch = appCss.match(
      /html\[data-app-surface="account-deletion"\] \.root-hydrate-fallback \{\s+min-height: 100dvh;/
    );
    const dynamicViewportIndex = dynamicViewportMatch?.index ?? -1;

    expect(fallbackIndex).toBeGreaterThanOrEqual(0);
    expect(appCss.slice(fallbackIndex, dynamicViewportIndex)).toContain(
      "min-height: 100vh;"
    );
    expect(dynamicViewportIndex).toBeGreaterThan(fallbackIndex);
  });
});
