import { runInNewContext } from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ACCOUNT_DELETION_AUTH_LOADING_CONTEXT,
  createAppSurfaceBootstrapScript,
  getDocumentAppSurface,
  getAppSurface,
  getCurrentAppSurface,
  synchronizeAppSurfaceDocument,
} from "./appSurface";
import { DELETION_AUTH_PENDING_STORAGE_KEY } from "~/config/storageKeys";

describe("AppSurface", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-app-surface");
    document.documentElement.removeAttribute("data-app-loading-context");
    document.documentElement.style.removeProperty("color-scheme");
    document.head.innerHTML = `
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/recwatch-logo.svg" type="image/svg+xml" />
    `;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("通常Routeはrecwatch Surfaceになる", () => {
    expect(getAppSurface("/dashboard")).toBe("recwatch");
  });

  it("HydrateFallback用にdocument上のSurfaceを読み取る", () => {
    document.documentElement.dataset.appSurface = "account-deletion";
    expect(getDocumentAppSurface()).toBe("account-deletion");

    document.documentElement.dataset.appSurface = "recwatch";
    expect(getDocumentAppSurface()).toBe("recwatch");
  });

  it("account-deletion以下はaccount-deletion Surfaceになる", () => {
    expect(getAppSurface("/account-deletion")).toBe("account-deletion");
    expect(getAppSurface("/account-deletion/callback")).toBe(
      "account-deletion"
    );
    expect(getAppSurface("/account-deletionish")).toBe("recwatch");
  });

  it("削除認証pendingがあるcallbackだけaccount-deletionになる", () => {
    expect(getAppSurface("/auth/callback", true)).toBe("account-deletion");
    expect(getAppSurface("/auth/callback", false)).toBe("recwatch");
  });

  it("pre-hydration scriptは削除callbackをlightで初期化し通常callbackをrecwatchにする", () => {
    window.localStorage.setItem("recwatch-theme", "dark");
    window.sessionStorage.setItem(DELETION_AUTH_PENDING_STORAGE_KEY, "1");
    window.history.replaceState({}, "", "/auth/callback");

    runInNewContext(createAppSurfaceBootstrapScript(), { window, document });

    expect(document.documentElement.dataset.appSurface).toBe(
      "account-deletion"
    );
    expect(document.documentElement.dataset.appLoadingContext).toBe(
      ACCOUNT_DELETION_AUTH_LOADING_CONTEXT
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("recwatch-theme")).toBe("dark");
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/recreation-favicon.png"
    );
    expect(document.querySelector('meta[name="viewport"]')).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1, viewport-fit=cover"
    );

    window.sessionStorage.removeItem(DELETION_AUTH_PENDING_STORAGE_KEY);
    runInNewContext(createAppSurfaceBootstrapScript(), { window, document });

    expect(document.documentElement.dataset.appSurface).toBe("recwatch");
    expect(document.documentElement.dataset.appLoadingContext).toBeUndefined();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("削除Surfaceを離れると保存済みテーマへ戻し、設定値は変更しない", () => {
    window.localStorage.setItem("recwatch-theme", "dark");

    synchronizeAppSurfaceDocument("/account-deletion", "account-deletion");

    expect(document.documentElement.dataset.appSurface).toBe(
      "account-deletion"
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem("recwatch-theme")).toBe("dark");
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/recreation-favicon.png"
    );
    expect(document.querySelector('meta[name="viewport"]')).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1, viewport-fit=cover"
    );

    synchronizeAppSurfaceDocument("/dashboard", "recwatch");

    expect(document.documentElement.dataset.appSurface).toBe("recwatch");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("recwatch-theme")).toBe("dark");
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/recwatch-logo.svg"
    );
    expect(document.querySelector('meta[name="viewport"]')).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1"
    );
  });

  it("loaderがpendingを消費した後も初回削除callback Surfaceを保持する", () => {
    document.documentElement.dataset.appSurface = "account-deletion";
    document.documentElement.dataset.appLoadingContext =
      ACCOUNT_DELETION_AUTH_LOADING_CONTEXT;
    window.sessionStorage.setItem(DELETION_AUTH_PENDING_STORAGE_KEY, "1");

    expect(getCurrentAppSurface("/auth/callback")).toBe("account-deletion");

    window.sessionStorage.removeItem(DELETION_AUTH_PENDING_STORAGE_KEY);
    synchronizeAppSurfaceDocument("/auth/callback", "account-deletion");

    expect(document.documentElement.dataset.appSurface).toBe(
      "account-deletion"
    );
    expect(document.documentElement.dataset.appLoadingContext).toBe(
      ACCOUNT_DELETION_AUTH_LOADING_CONTEXT
    );
  });
});
