import { createContext } from "react";

import {
  severityForFeedbackKind,
  type FeedbackContextValue,
} from "../model/app-notification";

const emptyContext: FeedbackContextValue = {
  notifications: [],
  toasts: [],
  unreadCount: 0,
  report: (input) => ({
    id: "",
    kind: input.kind,
    severity: severityForFeedbackKind(input.kind),
    title: input.title,
    message: input.message,
    createdAt: new Date(0).toISOString(),
    read: true,
    diagnostic: input.diagnostic,
  }),
  markRead: () => undefined,
  removeNotification: () => undefined,
  clearNotifications: () => undefined,
  dismissToast: () => undefined,
};

export const FeedbackContext =
  createContext<FeedbackContextValue>(emptyContext);
