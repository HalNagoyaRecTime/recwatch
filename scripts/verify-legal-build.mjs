import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { JSDOM } from "jsdom";

const projectRoot = process.cwd();
const publicRoot = resolve(projectRoot, "public");
const buildRoot = resolve(projectRoot, "build/client");

const legal = JSON.parse(
  await readFile(new URL("./legal-pages.json", import.meta.url), "utf8")
);

const pageRequirements = new Map([
  [
    "terms.html",
    {
      requiredLinks: [],
      requiredText: ["RE:CREATIONのアカウント削除を申請できます"],
    },
  ],
  [
    "privacy.html",
    {
      requiredLinks: legal.externalPrivacyLinks,
      requiredText: [
        "不要となった情報は合理的な期間内に削除または匿名化します",
      ],
    },
  ],
]);

const pages = legal.pages.map((page) => {
  const requirements = pageRequirements.get(page.fileName);
  assert.ok(requirements, `${page.fileName}: 検証条件がない`);

  return {
    ...page,
    requiredLinks: [
      ...legal.pages
        .filter((candidate) => candidate.path !== page.path)
        .map((candidate) => candidate.path),
      legal.accountDeletionPath,
      `mailto:${legal.contactEmail}`,
      ...requirements.requiredLinks,
    ],
    requiredText: [
      legal.operator,
      legal.representative,
      legal.address,
      legal.enactedAt.label,
      "学校のMicrosoft 365アカウント自体は削除されません",
      ...requirements.requiredText,
    ],
  };
});

async function readRequiredFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`必要なファイルを読み込めません: ${path}`, {
      cause: error,
    });
  }
}

function verifyMarkup(html, page) {
  const { document } = new JSDOM(html).window;
  const text = document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const links = new Set(
    [...document.querySelectorAll("a[href]")].map((link) =>
      link.getAttribute("href")
    )
  );

  assert.equal(document.doctype?.name, "html", `${page.fileName}: doctype`);
  assert.equal(document.documentElement.lang, "ja", `${page.fileName}: lang`);
  assert.equal(document.title, page.title, `${page.fileName}: title`);
  assert.equal(
    document
      .querySelector("meta[charset]")
      ?.getAttribute("charset")
      ?.toLowerCase(),
    "utf-8",
    `${page.fileName}: charset`
  );
  assert.ok(
    document.querySelector('meta[name="viewport"]'),
    `${page.fileName}: viewport`
  );
  assert.equal(
    document.querySelectorAll("h1").length,
    1,
    `${page.fileName}: h1`
  );
  assert.equal(
    document.querySelector("h1")?.textContent?.trim(),
    page.title,
    `${page.fileName}: h1 text`
  );
  assert.equal(
    document.querySelectorAll("main h2").length,
    page.headingCount,
    `${page.fileName}: h2 count`
  );
  assert.equal(
    document.querySelectorAll("script").length,
    0,
    `${page.fileName}: JavaScriptを含めない`
  );
  assert.ok(
    document.querySelector('link[rel="stylesheet"][href="/legal/legal.css"]'),
    `${page.fileName}: stylesheet`
  );
  assert.equal(
    document.querySelectorAll('[aria-current="page"]').length,
    1,
    `${page.fileName}: current navigation`
  );
  assert.equal(
    document.querySelector("time")?.getAttribute("datetime"),
    legal.enactedAt.datetime,
    `${page.fileName}: enacted date`
  );

  for (const element of document.querySelectorAll("*")) {
    for (const attribute of element.getAttributeNames()) {
      assert.doesNotMatch(
        attribute,
        /^on/i,
        `${page.fileName}: inline event handlerを含めない`
      );
    }
  }

  for (const link of document.querySelectorAll("a")) {
    assert.ok(link.getAttribute("href"), `${page.fileName}: hrefのないリンク`);
    assert.ok(
      link.textContent?.trim(),
      `${page.fileName}: 名前のないリンクを含めない`
    );
  }

  for (const requiredLink of page.requiredLinks) {
    assert.ok(links.has(requiredLink), `${page.fileName}: ${requiredLink}`);
  }

  for (const requiredText of page.requiredText) {
    assert.ok(text.includes(requiredText), `${page.fileName}: ${requiredText}`);
  }

  assert.doesNotMatch(
    text,
    /TODO|TBD|PLACEHOLDER|仮値|未確定|要確認/i,
    `${page.fileName}: プレースホルダーを含めない`
  );
}

for (const page of pages) {
  const sourcePath = resolve(publicRoot, "legal", page.fileName);
  const outputPath = resolve(buildRoot, "legal", page.fileName);
  const sourceHtml = await readRequiredFile(sourcePath);
  const outputHtml = await readRequiredFile(outputPath);

  assert.equal(
    outputHtml,
    sourceHtml,
    `${page.fileName}: build時に内容が変化した`
  );
  verifyMarkup(outputHtml, page);
}

for (const relativePath of ["legal/legal.css", "_headers", "_redirects"]) {
  const source = await readRequiredFile(resolve(publicRoot, relativePath));
  const output = await readRequiredFile(resolve(buildRoot, relativePath));
  assert.equal(
    output,
    source,
    `${relativePath}: build成果物に正しくコピーされていない`
  );
}

const redirects = (await readRequiredFile(resolve(buildRoot, "_redirects")))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

assert.deepEqual(
  redirects,
  legal.pages.map(({ path }) => `${path} ${path.replace(/\.html$/, "")} 200`)
);

const headers = await readRequiredFile(resolve(buildRoot, "_headers"));
const headerPaths = legal.pages.flatMap(({ path }) => [
  path,
  path.replace(/\.html$/, ""),
]);
for (const path of headerPaths) {
  assert.ok(headers.includes(`${path}\n`), `_headers: ${path}`);
}
assert.equal(
  headers.match(/Content-Type: text\/html; charset=utf-8/g)?.length,
  headerPaths.length,
  "_headers: HTMLのContent-Type"
);

console.log("法務ページのbuild成果物を検証しました。");
