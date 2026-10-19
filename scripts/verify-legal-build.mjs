import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const publicRoot = resolve(projectRoot, "public");
const buildRoot = resolve(projectRoot, "build/client");

const legal = JSON.parse(
  await readFile(new URL("./legal-pages.json", import.meta.url), "utf8")
);

async function readRequiredFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`必要なファイルを読み込めません: ${path}`, {
      cause: error,
    });
  }
}

// 文書の内容はlegal-static-pages.test.tsで検証する。
// ここではpublicの法務ファイルがbuild成果物へそのままコピーされたかだけを確認する。
const relativePaths = [
  ...legal.pages.map(({ fileName }) => `legal/${fileName}`),
  "legal/legal.css",
  "_headers",
  "_redirects",
];

for (const relativePath of relativePaths) {
  const source = await readRequiredFile(resolve(publicRoot, relativePath));
  const output = await readRequiredFile(resolve(buildRoot, relativePath));
  assert.equal(
    output,
    source,
    `${relativePath}: build成果物に正しくコピーされていない`
  );
}

console.log("法務ページのbuild成果物を検証しました。");
