import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useFeedback } from "../hooks/useFeedback";
import type { AppNotification } from "../model/app-notification";

const toastIcon = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  error: AlertCircleIcon,
} as const;

const TOAST_EXIT_DURATION_MS = 220;

export function FeedbackToastHost() {
  const { toasts, dismissToast } = useFeedback();
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const exitingIdsRef = useRef(new Set<string>());
  const exitTimersRef = useRef(new Map<string, number>());

  useEffect(() => {
    const exitTimers = exitTimersRef.current;
    return () => {
      exitTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const requestDismiss = useCallback(
    (id: string) => {
      if (exitingIdsRef.current.has(id)) return;

      exitingIdsRef.current.add(id);
      setExitingIds(new Set(exitingIdsRef.current));
      const timer = window.setTimeout(() => {
        dismissToast(id);
        exitingIdsRef.current.delete(id);
        exitTimersRef.current.delete(id);
        setExitingIds(new Set(exitingIdsRef.current));
      }, TOAST_EXIT_DURATION_MS);
      exitTimersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-200 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <FeedbackToast
          key={toast.id}
          toast={toast}
          isExiting={exitingIds.has(toast.id)}
          onDismiss={requestDismiss}
        />
      ))}
    </div>
  );
}

function FeedbackToast({
  toast,
  isExiting,
  onDismiss,
}: {
  toast: AppNotification;
  isExiting: boolean;
  onDismiss: (id: string) => void;
}) {
  const Icon = toastIcon[toast.severity];

  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 4000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={`shadow-soft border-border-subtle bg-surface-base pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${isExiting ? "feedback-toast-exit" : "feedback-toast-enter"}`}
      role={toast.severity === "error" ? "alert" : "status"}
    >
      <Icon
        aria-hidden="true"
        className="text-brand-primary mt-0.5 shrink-0"
        size={16}
      />
      <div className="min-w-0 flex-1">
        <p className="text-text-base font-medium">{toast.title}</p>
        <p className="text-text-muted">{toast.message}</p>
      </div>
      <button
        type="button"
        className="text-text-muted hover:text-text-base"
        aria-label="通知を閉じる"
        onClick={() => onDismiss(toast.id)}
      >
        <XIcon aria-hidden="true" size={15} />
      </button>
    </div>
  );
}
