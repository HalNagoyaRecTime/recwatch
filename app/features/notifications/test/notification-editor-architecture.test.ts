import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { expect, it } from "vitest";

const featureRoot = resolve("app/features/notifications");

function layer(path: string) {
  if (path.startsWith("model/")) return "domain";
  if (path.startsWith("api/contracts/")) return "contracts";
  if (path.startsWith("api/") || path.startsWith("mock/"))
    return "infrastructure";
  if (path.startsWith("hooks/")) return "application";
  return "presentation";
}

it("通知の新規・編集からたどれる依存は4層の境界を守る", () => {
  const pending = [
    resolve(featureRoot, "pages/NotificationCreatePage.tsx"),
    resolve(featureRoot, "pages/NotificationEditPage.tsx"),
  ];
  const visited = new Set<string>();
  const violations: string[] = [];

  while (pending.length) {
    const file = pending.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    const sourcePath = relative(featureRoot, file).split(sep).join("/");
    const sourceLayer = layer(sourcePath);
    const source = readFileSync(file, "utf8");
    // 型の再公開と遅延importも含めて、Feature内の参照先をたどる。
    for (const match of source.matchAll(
      /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g
    )) {
      const specifier = match[1];
      const base = specifier.startsWith("~/")
        ? resolve("app", specifier.slice(2))
        : specifier.startsWith(".")
          ? resolve(dirname(file), specifier)
          : null;
      if (!base || !base.startsWith(`${featureRoot}${sep}`)) continue;
      const target = [
        `${base}.ts`,
        `${base}.tsx`,
        resolve(base, "index.ts"),
        resolve(base, "index.tsx"),
      ].find(existsSync);
      if (!target) continue;
      const targetPath = relative(featureRoot, target).split(sep).join("/");
      const targetLayer = layer(targetPath);
      const allowed =
        sourceLayer === "domain"
          ? targetLayer === "domain"
          : sourceLayer === "contracts"
            ? ["contracts", "domain"].includes(targetLayer)
            : sourceLayer === "application"
              ? ["application", "contracts", "domain"].includes(targetLayer)
              : sourceLayer === "presentation"
                ? targetLayer !== "infrastructure"
                : true;
      if (!allowed) violations.push(`${sourcePath} → ${targetPath}`);
      pending.push(target);
    }
  }

  expect(violations).toEqual([]);
});
