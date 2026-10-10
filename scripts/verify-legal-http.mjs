import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const buildRoot = resolve(projectRoot, "build/client");
const baseUrl = parseBaseUrl(process.env.LEGAL_BASE_URL);
const maxAttempts = 10;
const initialRetryDelayMs = 1_000;
const maxRetryDelayMs = 5_000;

const pages = await Promise.all(
  [
    {
      path: "/legal/terms.html",
      source: resolve(buildRoot, "legal/terms.html"),
      title: "RE:CREATION 利用規約",
    },
    {
      path: "/legal/privacy.html",
      source: resolve(buildRoot, "legal/privacy.html"),
      title: "RE:CREATION プライバシーポリシー",
    },
  ].map(async (page) => ({
    ...page,
    expectedHtml: await readFile(page.source, "utf8"),
  }))
);

let lastError;
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    await verifyDeployment();
    console.log(`法務ページのHTTP配信を検証しました: ${baseUrl}`);
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt === maxAttempts) break;

    console.warn(
      `法務ページの反映待ちです (${attempt}/${maxAttempts}): ${errorMessage(error)}`
    );
    await wait(retryDelay(attempt));
  }
}

if (lastError) {
  throw new Error(
    `${baseUrl} の法務ページを${maxAttempts}回確認しましたが、正しく配信されませんでした`,
    { cause: lastError }
  );
}

async function verifyDeployment() {
  const legalBodies = new Set(pages.map((page) => page.expectedHtml));
  const legalHeadings = pages.map((page) => `<h1>${page.title}</h1>`);

  await Promise.all(pages.map((page) => verifyLegalPageTwice(page)));

  const fallbackResponses = await Promise.all(
    ["/login", "/dashboard", "/legal/not-found"].map(async (path) => {
      const result = await requestText(path, "follow");
      return { path, ...result };
    })
  );
  for (const { path, response, body } of fallbackResponses) {
    assert.equal(response.status, 200, `${path}: SPA画面がHTTP 200ではない`);
    assertHtmlUtf8(
      response.headers.get("content-type"),
      `${path}: Content-Type`
    );
    assert.ok(
      !legalBodies.has(body),
      `${path}: SPA画面を法務文書として成功扱いしている`
    );
    for (const heading of legalHeadings) {
      assert.ok(!body.includes(heading), `${path}: 法務文書の見出しが返された`);
    }
  }
}

async function verifyLegalPageTwice(page) {
  await verifyLegalPage(page, "直接アクセス");
  await verifyLegalPage(page, "再読込");
}

async function verifyLegalPage(page, access) {
  const { response, body } = await requestText(page.path, "manual");
  const label = `${page.path}: ${access}`;

  assert.equal(response.status, 200, `${label}がHTTP 200ではない`);
  assertHtmlUtf8(
    response.headers.get("content-type"),
    `${label}のContent-Type`
  );
  assert.equal(
    response.headers.get("content-language"),
    "ja",
    `${label}のContent-Language`
  );
  assert.ok(
    body === page.expectedHtml,
    `${label}でbuild成果物と異なる内容が返された ` +
      `(expected ${digest(page.expectedHtml)}, actual ${digest(body)})`
  );
  assert.ok(body.includes(`<h1>${page.title}</h1>`), `${label}の見出し`);
}

async function requestText(path, redirect) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache",
    },
    redirect,
    signal: AbortSignal.timeout(5_000),
  });
  const bytes = await response.arrayBuffer();
  const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return { response, body };
}

function parseBaseUrl(value) {
  assert.ok(value?.trim(), "LEGAL_BASE_URLが設定されていません");

  const url = new URL(value.trim());
  const allowedHost =
    url.hostname === "recwatch.pages.dev" ||
    url.hostname.endsWith(".recwatch.pages.dev");

  assert.equal(url.protocol, "https:", "LEGAL_BASE_URLはHTTPSが必要です");
  assert.ok(allowedHost, "LEGAL_BASE_URLはrecwatch.pages.devのみ指定できます");
  assert.equal(url.port, "", "LEGAL_BASE_URLにポートは指定できません");
  assert.equal(url.username, "", "LEGAL_BASE_URLに認証情報は指定できません");
  assert.equal(url.password, "", "LEGAL_BASE_URLに認証情報は指定できません");
  assert.ok(
    url.pathname === "/" && !url.search && !url.hash,
    "LEGAL_BASE_URLにはoriginだけを指定してください"
  );

  return url.origin;
}

function assertHtmlUtf8(value, label) {
  assert.ok(value, `${label}: ヘッダーがない`);
  const [mediaType, ...parameters] = value
    .toLowerCase()
    .split(";")
    .map((part) => part.trim());

  assert.equal(mediaType, "text/html", `${label}: media type`);
  assert.ok(parameters.includes("charset=utf-8"), `${label}: charset`);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function retryDelay(attempt) {
  return Math.min(initialRetryDelayMs * 2 ** (attempt - 1), maxRetryDelayMs);
}

function wait(milliseconds) {
  return new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
}
