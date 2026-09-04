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

const toastIconClass = {
  info: "text-brand-primary",
  success: "text-tone-success-text",
  warning: "text-tone-warning-text",
  error: "text-tone-danger-text",
} as const;

const TOAST_EXIT_DURATION_MS = 220;
const TOAST_DURATION_MS = 4000;

export function FeedbackToastHost() {
  const { toasts, notifications, dismissToast, openNotificationCenter } =
    useFeedback();
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

  const openSavedNotification = useCallback(
    (id: string) => {
      if (notifications.some((notification) => notification.id === id)) {
        openNotificationCenter(id);
      }
    },
    [notifications, openNotificationCenter]
  );

  return (
    <div className="pointer-events-none fixed top-15 right-4 z-200 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <FeedbackToast
          key={toast.id}
          toast={toast}
          isSaved={notifications.some(
            (notification) => notification.id === toast.id
          )}
          isExiting={exitingIds.has(toast.id)}
          onDismiss={requestDismiss}
          onOpenNotificationCenter={openSavedNotification}
        />
      ))}
    </div>
  );
}

function FeedbackToast({
  toast,
  isSaved,
  isExiting,
  onDismiss,
  onOpenNotificationCenter,
}: {
  toast: AppNotification;
  isSaved: boolean;
  isExiting: boolean;
  onDismiss: (id: string) => void;
  onOpenNotificationCenter: (notificationId: string) => void;
}) {
  const Icon = toastIcon[toast.severity];
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

  const handleToastActivate = () => {
    if (isSaved) onOpenNotificationCenter(toast.id);
    onDismiss(toast.id);
  };

  useEffect(() => {
    resumeTimer();
    return clearTimer;
  }, [clearTimer, resumeTimer]);

  return (
    <div
      className={`shadow-soft border-border-subtle bg-surface-base group/toast pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${isExiting ? "feedback-toast-exit" : "feedback-toast-enter"}`}
      role={toast.severity === "error" ? "alert" : "status"}
      onClick={handleToastActivate}
      onPointerEnter={() => setPauseReason("hover", true)}
      onPointerLeave={() => setPauseReason("hover", false)}
      onFocus={() => setPauseReason("focus", true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPauseReason("focus", false);
        }
      }}
    >
      {isSaved ? (
        <button
          type="button"
          className="text-text-base focus-visible:outline-brand-primary flex min-w-0 flex-1 items-start gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            handleToastActivate();
          }}
        >
          <ToastBody Icon={Icon} toast={toast} />
        </button>
      ) : (
        <div className="text-text-base flex min-w-0 flex-1 items-start gap-2">
          <ToastBody Icon={Icon} toast={toast} />
        </div>
      )}
      <button
        type="button"
        className="text-text-muted hover:text-text-base flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
        aria-label="通知を閉じる"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(toast.id);
        }}
      >
        <XIcon aria-hidden="true" size={13} />
      </button>
    </div>
  );
}

function ToastBody({
  Icon,
  toast,
}: {
  Icon: typeof InfoIcon;
  toast: AppNotification;
}) {
  return (
    <>
      <Icon
        aria-hidden="true"
        className={`${toastIconClass[toast.severity]} mt-0.5 shrink-0`}
        size={16}
      />
      <div className="min-w-0 flex-1">
        <p className="text-text-base min-w-0 font-medium break-words">
          {toast.title}
        </p>
        <p className="text-text-muted break-words whitespace-pre-wrap">
          {toast.message}
        </p>
      </div>
    </>
  );
}
