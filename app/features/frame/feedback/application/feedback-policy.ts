import type { FeedbackKind, FeedbackSeverity } from "../model/app-notification";

export type FeedbackPolicy = {
  severity: FeedbackSeverity;
  showToast: boolean;
  saveToCenter: boolean;
};

export function getFeedbackPolicy(kind: FeedbackKind): FeedbackPolicy {
  switch (kind) {
    case "validation":
      return { severity: "info", showToast: false, saveToCenter: false };
    case "action-success":
      return { severity: "success", showToast: true, saveToCenter: false };
    case "action-error":
      return { severity: "error", showToast: true, saveToCenter: true };
    case "background-success":
      return { severity: "success", showToast: false, saveToCenter: true };
    case "background-error":
      return { severity: "error", showToast: true, saveToCenter: true };
    case "system-warning":
      return { severity: "warning", showToast: true, saveToCenter: true };
    case "system-error":
      return { severity: "error", showToast: true, saveToCenter: true };
    case "info":
      return { severity: "info", showToast: true, saveToCenter: false };
  }
}
