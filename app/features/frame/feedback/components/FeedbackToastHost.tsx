import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Maximize2Icon,
  Minimize2Icon,
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
const TOAST_DURATION_MS = 4000;

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
    <div className="pointer-events-none fixed top-4 right-4 z-200 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
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
  const [isExpanded, setIsExpanded] = useState(true);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const remainingMsRef = useRef(TOAST_DURATION_MS);
  const pauseReasonsRef = useRef({ hover: false, focus: false });

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
    startedAtRef.current = null;
  }, []);

  const resumeTimer = useCallback(() => {
    if (
      timerRef.current !== null ||
      remainingMsRef.current <= 0 ||
      pauseReasonsRef.current.hover ||
      pauseReasonsRef.current.focus
    ) {
      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      startedAtRef.current = null;
      remainingMsRef.current = 0;
      onDismiss(toast.id);
    }, remainingMsRef.current);
  }, [onDismiss, toast.id]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current === null || startedAtRef.current === null) return;
    remainingMsRef.current = Math.max(
      0,
      remainingMsRef.current - (Date.now() - startedAtRef.current)
    );
    clearTimer();
  }, [clearTimer]);

  const setPauseReason = useCallback(
    (reason: "hover" | "focus", paused: boolean) => {
      pauseReasonsRef.current[reason] = paused;
      if (paused) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    },
    [pauseTimer, resumeTimer]
  );

  useEffect(() => {
    resumeTimer();
    return clearTimer;
  }, [clearTimer, resumeTimer]);

  return (
    <div
      className={`shadow-soft border-border-subtle bg-surface-base group/toast pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${isExiting ? "feedback-toast-exit" : "feedback-toast-enter"}`}
      role={toast.severity === "error" ? "alert" : "status"}
      onPointerEnter={() => setPauseReason("hover", true)}
      onPointerLeave={() => setPauseReason("hover", false)}
      onFocus={() => setPauseReason("focus", true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPauseReason("focus", false);
        }
      }}
    >
      <Icon
        aria-hidden="true"
        className="text-brand-primary mt-0.5 shrink-0"
        size={16}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="text-text-base min-w-0 flex-1 font-medium break-words">
            {toast.title}
          </p>
          <div className="text-text-muted grid shrink-0 items-center">
            <time
              className="pointer-events-none col-start-1 row-start-1 justify-self-end text-[11px] transition-opacity group-focus-within/toast:opacity-0 group-hover/toast:opacity-0 [@media(hover:none)]:opacity-0"
              dateTime={toast.createdAt}
            >
              {formatToastTime(toast.createdAt)}
            </time>
            <div className="relative col-start-1 row-start-1 flex justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/toast:opacity-100 group-hover/toast:opacity-100 [@media(hover:none)]:opacity-100">
              <button
                type="button"
                className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                aria-label={isExpanded ? "通知を小さくする" : "通知を元に戻す"}
                onClick={() => setIsExpanded((expanded) => !expanded)}
              >
                {isExpanded ? (
                  <Minimize2Icon aria-hidden="true" size={13} />
                ) : (
                  <Maximize2Icon aria-hidden="true" size={13} />
                )}
              </button>
              <button
                type="button"
                className="hover:text-text-base flex size-6 items-center justify-center rounded-md transition-colors"
                aria-label="通知を閉じる"
                onClick={() => onDismiss(toast.id)}
              >
                <XIcon aria-hidden="true" size={13} />
              </button>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <p className="text-text-muted break-words whitespace-pre-wrap">
            {toast.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function formatToastTime(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
}
