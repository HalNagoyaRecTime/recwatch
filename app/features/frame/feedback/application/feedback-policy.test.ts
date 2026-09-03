import { describe, expect, it } from "vitest";

import { getFeedbackPolicy } from "./feedback-policy";

describe("Feedback policy", () => {
  it.each([
    ["validation", false, false, "info"],
    ["action-success", true, false, "success"],
    ["action-error", true, true, "error"],
    ["background-success", false, true, "success"],
    ["background-error", true, true, "error"],
    ["system-warning", true, true, "warning"],
    ["system-error", true, true, "error"],
  ] as const)(
    "%s の表示・保存ポリシーを返す",
    (kind, showToast, saveToCenter, severity) => {
      expect(getFeedbackPolicy(kind)).toEqual({
        showToast,
        saveToCenter,
        severity,
      });
    }
  );
});
