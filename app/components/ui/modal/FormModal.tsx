import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "~/lib/cn";

type FormModalProps = {
  children: ReactNode | ((requestClose: () => void) => ReactNode);
  description?: ReactNode;
  onClose: () => void;
  size?: "md" | "xl";
  title: ReactNode;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getTransitionDuration(): number {
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 180;
}

function animateElement(
  element: HTMLElement | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation | undefined {
  return typeof element?.animate === "function"
    ? element.animate(keyframes, options)
    : undefined;
}

export function FormModal({
  children,
  description,
  onClose,
  size = "md",
  title,
}: FormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [isClosing, setIsClosing] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const requestClose = useCallback(() => setIsClosing(true), []);

  useEffect(() => {
    const duration = getTransitionDuration();
    const options: KeyframeAnimationOptions = {
      duration,
      easing: "ease-out",
      fill: "forwards",
    };
    const backdropAnimation = animateElement(
      backdropRef.current,
      [{ opacity: 0 }, { opacity: 1 }],
      options
    );
    const panelAnimation = animateElement(
      panelRef.current,
      [
        { opacity: 0, transform: "scale(0.95)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      options
    );

    return () => {
      backdropAnimation?.cancel();
      panelAnimation?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isClosing) return;

    const duration = getTransitionDuration();
    const options: KeyframeAnimationOptions = {
      duration,
      easing: "ease-in",
      fill: "forwards",
    };
    const backdropAnimation = animateElement(
      backdropRef.current,
      [{ opacity: 1 }, { opacity: 0 }],
      options
    );
    const panelAnimation = animateElement(
      panelRef.current,
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.95)" },
      ],
      options
    );
    const closeTimer = window.setTimeout(onClose, duration);

    return () => {
      window.clearTimeout(closeTimer);
      backdropAnimation?.cancel();
      panelAnimation?.cancel();
    };
  }, [isClosing, onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const panel = panelRef.current;
    const initialFocusTarget =
      panel?.querySelector<HTMLElement>(focusableSelector) ?? panel;
    initialFocusTarget?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements.at(-1)!;
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === first || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [requestClose]);

  const content =
    typeof children === "function" ? children(requestClose) : children;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4 opacity-0 will-change-[opacity]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      ref={backdropRef}
      role="presentation"
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "border-border-base bg-surface-base flex max-h-[min(720px,calc(100dvh-2rem))] w-full scale-95 flex-col overflow-hidden rounded-xl border opacity-0 shadow-lg will-change-[opacity,transform]",
          size === "xl" ? "max-w-5xl" : "max-w-xl"
        )}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="border-border-subtle flex shrink-0 items-start justify-between border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-text-base text-lg font-semibold" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="text-text-muted mt-1 text-sm" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="閉じる"
            className="text-text-muted hover:bg-surface-hover hover:text-text-base -mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-xl"
            onClick={requestClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto px-5 py-5">{content}</div>
      </section>
    </div>
  );
}
