import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const projectRoot = process.cwd();
const buildRoot = resolve(projectRoot, "build/client");
const wranglerPackage = require.resolve("wrangler/package.json");
const wranglerScript = resolve(dirname(wranglerPackage), "bin/wrangler.js");

const pages = [
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
];

let runtimeRoot;
let wrangler;
let cleanupPromise;
let stdout = "";
let stderr = "";

const signalHandlers = new Map();
for (const [signal, exitCode] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
]) {
  const handler = () => {
    process.exitCode = exitCode;
    void cleanup()
      .catch((error) => console.error(error))
      .finally(() => process.exit());
  };
  signalHandlers.set(signal, handler);
  process.once(signal, handler);
}

try {
  runtimeRoot = await mkdtemp(join(tmpdir(), "recwatch-legal-http-"));
  wrangler = startWrangler(runtimeRoot);
  const { ip, port } = await waitForReady(wrangler, 50_000);
  const origin = `http://${ip}:${port}`;
  const legalBodies = new Set();
  const legalHeadings = new Set();

  for (const page of pages) {
    const expectedHtml = await readFile(page.source, "utf8");
    const heading = `<h1>${page.title}</h1>`;
    legalBodies.add(expectedHtml);
    legalHeadings.add(heading);

    for (const access of ["直接アクセス", "再読込"]) {
      const response = await fetch(`${origin}${page.path}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(5_000),
      });
      const body = await response.text();

      assert.equal(
        response.status,
        200,
        `${page.path}: ${access}がHTTP 200ではない`
      );
      assertHtmlUtf8(
        response.headers.get("content-type"),
        `${page.path}: ${access}のContent-Type`
      );
      assert.equal(
        response.headers.get("content-language"),
        "ja",
        `${page.path}: ${access}のContent-Language`
      );
      assert.equal(
        body,
        expectedHtml,
        `${page.path}: ${access}で法務文書以外が返された`
      );
      assert.ok(body.includes(heading), `${page.path}: ${access}の見出し`);
    }
  }

  for (const path of ["/login", "/dashboard", "/legal/not-found"]) {
    const response = await fetch(`${origin}${path}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.text();

    assert.ok(
      !legalBodies.has(body),
      `${path}: SPA画面を法務文書として成功扱いしている`
    );
    for (const heading of legalHeadings) {
      assert.ok(!body.includes(heading), `${path}: 法務文書の見出しが返された`);
    }
  }

  console.log("法務ページのHTTP配信を検証しました。");
} catch (error) {
  const diagnostics = [stdout, stderr].filter(Boolean).join("\n").trim();
  if (diagnostics) {
    console.error("Wranglerの直近の出力:\n" + diagnostics);
  }
  throw error;
} finally {
  for (const [signal, handler] of signalHandlers) {
    process.removeListener(signal, handler);
  }
  await cleanup();
}

function startWrangler(tempRoot) {
  const child = fork(
    wranglerScript,
    [
      "pages",
      "dev",
      buildRoot,
      "--ip=127.0.0.1",
      "--port=0",
      "--inspector-port=0",
      `--persist-to=${resolve(tempRoot, "state")}`,
      "--log-level=error",
      "--show-interactive-dev-session=false",
    ],
    {
      cwd: tempRoot,
      env: {
        ...process.env,
        CI: "true",
        MINIFLARE_REGISTRY_PATH: resolve(tempRoot, "miniflare-registry.json"),
        NO_COLOR: "1",
        WRANGLER_REGISTRY_PATH: resolve(tempRoot, "wrangler-registry.json"),
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    }
  );

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout = appendRecentOutput(stdout, chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr = appendRecentOutput(stderr, chunk);
  });
  return child;
}

function waitForReady(child, timeoutMs) {
  return new Promise((resolveReady, reject) => {
    const timeout = setTimeout(() => {
      finish(
        new Error(
          `Wranglerの起動が${timeoutMs / 1_000}秒以内に完了しませんでした`
        )
      );
    }, timeoutMs);

    const onMessage = (message) => {
      const payload = parseIpcMessage(message);
      if (
        payload &&
        payload.event === "DEV_SERVER_READY" &&
        typeof payload.ip === "string" &&
        typeof payload.port === "number"
      ) {
        finish(undefined, { ip: payload.ip, port: payload.port });
      }
    };
    const onError = (error) => finish(error);
    const onExit = (code, signal) =>
      finish(
        new Error(
          `Wranglerが起動前に終了しました (code ${String(code)}, signal ${String(signal)})`
        )
      );

    child.on("message", onMessage);
    child.once("error", onError);
    child.once("exit", onExit);

    function finish(error, address) {
      clearTimeout(timeout);
      child.removeListener("message", onMessage);
      child.removeListener("error", onError);
      child.removeListener("exit", onExit);

      if (error) reject(error);
      else resolveReady(address);
    }
  });
}

function parseIpcMessage(message) {
  if (message && typeof message === "object") return message;
  if (typeof message !== "string") return undefined;

  try {
    const parsed = JSON.parse(message);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
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

async function cleanup() {
  if (cleanupPromise) return cleanupPromise;

  cleanupPromise = (async () => {
    let cleanupError;
    try {
      if (wrangler) await stopProcess(wrangler);
    } catch (error) {
      cleanupError = error;
    }

    try {
      if (runtimeRoot) {
        await rm(runtimeRoot, { recursive: true, force: true });
      }
    } catch (error) {
      cleanupError ??= error;
    }

    if (cleanupError) throw cleanupError;
  })();

  return cleanupPromise;
}

async function stopProcess(child) {
  if (hasExited(child)) return;

  child.kill("SIGTERM");
  if (await waitForExit(child, 5_000)) return;

  child.kill("SIGKILL");
  if (!(await waitForExit(child, 5_000))) {
    throw new Error("Wranglerを終了できませんでした");
  }
}

function waitForExit(child, timeoutMs) {
  if (hasExited(child)) return Promise.resolve(true);

  return new Promise((resolveExit) => {
    const timeout = setTimeout(() => finish(false), timeoutMs);
    child.once("exit", onExit);

    function onExit() {
      finish(true);
    }

    function finish(exited) {
      clearTimeout(timeout);
      child.removeListener("exit", onExit);
      resolveExit(exited);
    }
  });
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function appendRecentOutput(current, chunk) {
  return (current + chunk).slice(-4_000);
}
