import type { FeedbackInput, FeedbackKind } from "~/features/frame/feedback";
import { ApiClientError } from "~/lib/api-client-error";

export type NotificationFeedbackInput = FeedbackInput & {
  kind: Extract<
    FeedbackKind,
    "action-success" | "action-error" | "background-error"
  >;
};

export type NotificationFeedbackReporter = (
  input: NotificationFeedbackInput
) => unknown;

export function reportNotificationActionError(
  report: NotificationFeedbackReporter | undefined,
  input: {
    title: string;
    message: string;
    action: string;
    endpoint: string;
    error: unknown;
  }
) {
  report?.({
    kind: "action-error",
    title: input.title,
    message: input.message,
    diagnostic: toDiagnostic(input),
  });
}

export function reportNotificationBackgroundError(
  report: NotificationFeedbackReporter | undefined,
  input: {
    title: string;
    message: string;
    action: string;
    endpoint: string;
    error: unknown;
  }
) {
  report?.({
    kind: "background-error",
    title: input.title,
    message: input.message,
    diagnostic: toDiagnostic(input),
  });
}

function toDiagnostic(input: {
  action: string;
  endpoint: string;
  error: unknown;
}) {
  return {
    action: input.action,
    endpoint: input.endpoint,
    ...(input.error instanceof ApiClientError
      ? { status: input.error.status, errorCode: input.error.code }
      : {}),
  };
}
