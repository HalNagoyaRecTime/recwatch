import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearDeletionAuthPending,
  clearDeletionAuthResult,
  consumeDeletionAuthPending,
  consumeDeletionAuthResult,
  markDeletionAuthPending,
  saveDeletionAuthResult,
} from "../lib/deletionAuthFlow";

describe("deletionAuthFlow", () => {
  const sessionStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "sessionStorage"
  );

  afterEach(() => {
    if (sessionStorageDescriptor) {
      Object.defineProperty(window, "sessionStorage", sessionStorageDescriptor);
    }
    vi.restoreAllMocks();
  });

  it("sessionStorageのAPIが例外を投げても認証フローを停止しない", () => {
    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new Error("sessionStorage is unavailable");
      }),
      setItem: vi.fn(() => {
        throw new Error("sessionStorage is unavailable");
      }),
      removeItem: vi.fn(() => {
        throw new Error("sessionStorage is unavailable");
      }),
    } as unknown as Storage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: unavailableStorage,
    });

    expect(() => markDeletionAuthPending()).not.toThrow();
    expect(() => clearDeletionAuthPending()).not.toThrow();
    expect(() =>
      saveDeletionAuthResult({ status: "confirmed", token: "token" })
    ).not.toThrow();
    expect(() => clearDeletionAuthResult()).not.toThrow();
    expect(consumeDeletionAuthPending()).toBe(false);
    expect(consumeDeletionAuthResult()).toBeNull();
  });
});
