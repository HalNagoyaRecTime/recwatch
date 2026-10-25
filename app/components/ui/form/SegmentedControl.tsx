import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { NavLink, useLocation } from "react-router";

import {
  controlSurfaceStyle,
  disabledControlTextStyle,
} from "~/components/ui/form/styles/control-styles";

type SegmentBase = {
  icon?: LucideIcon;
  label: string;
};

type SegmentTone = "info" | "success" | "danger";

type SelectionSegment<T extends string> = SegmentBase & {
  disabled?: boolean;
  tone?: SegmentTone;
  value: T;
};

type NavigationSegment = SegmentBase & {
  end?: boolean;
  to: string;
};

type SegmentedControlProps<T extends string> =
  | {
      ariaLabel: string;
      behavior: "selection";
      disabled?: boolean;
      onValueChange: (value: T) => void;
      options: readonly SelectionSegment<T>[];
      value: T;
    }
  | {
      ariaLabel: string;
      behavior: "navigation";
      options: readonly NavigationSegment[];
    };

type SegmentContentProps = SegmentBase & {
  active: boolean;
  disabled?: boolean;
  tone?: SegmentTone;
};

const segmentToneStyles: Record<
  SegmentTone,
  { backgroundClassName: string; textClassName: string }
> = {
  info: {
    backgroundClassName: "bg-sky-50 dark:bg-sky-950",
    textClassName: "text-sky-700 dark:text-sky-300",
  },
  success: {
    backgroundClassName: "bg-tone-success-bg",
    textClassName: "text-tone-success-text",
  },
  danger: {
    backgroundClassName: "bg-tone-danger-bg",
    textClassName: "text-tone-danger-text",
  },
};

const segmentClassName = (icon: LucideIcon | undefined) =>
  `app-rounded relative z-10 flex h-full cursor-pointer items-center justify-center ${
    icon === undefined ? "min-w-9 px-3" : "aspect-square"
  }`;

function SegmentContent({
  active,
  disabled = false,
  icon: Icon,
  label,
  tone,
}: SegmentContentProps) {
  return (
    <span
      className={`group-disabled:text-text-subtle flex items-center justify-center text-sm transition-colors duration-200 ${
        disabled
          ? "text-text-subtle"
          : tone
            ? segmentToneStyles[tone].textClassName
            : active
              ? "text-text-base"
              : "text-text-subtle group-hover:text-text-base"
      }`}
    >
      {Icon === undefined ? (
        label
      ) : (
        <Icon aria-hidden="true" className="size-4.5" />
      )}
    </span>
  );
}

function useSegmentIndicator(activeKey: string, options: readonly unknown[]) {
  const containerRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;

    if (container === null || indicator === null) {
      return;
    }

    const updateIndicator = () => {
      const activeSegment = container.querySelector<HTMLElement>(
        '[aria-pressed="true"], [aria-current="page"]'
      );

      if (activeSegment === null) {
        indicator.style.opacity = "0";
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const segmentRect = activeSegment.getBoundingClientRect();
      const inset = 2;

      indicator.style.width = `${Math.max(segmentRect.width - inset * 2, 0)}px`;
      indicator.style.transform = `translateX(${segmentRect.left - containerRect.left + inset}px)`;
      indicator.style.opacity = "1";
    };

    updateIndicator();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(container);
    container
      .querySelectorAll<HTMLElement>("[data-segment]")
      .forEach((segment) => resizeObserver.observe(segment));

    return () => resizeObserver.disconnect();
  }, [activeKey, options]);

  return { containerRef, indicatorRef };
}

function SegmentIndicator({
  indicatorRef,
  tone,
  disabled = false,
}: {
  indicatorRef: RefObject<HTMLSpanElement | null>;
  tone?: SegmentTone;
  disabled?: boolean;
}) {
  return (
    <span
      ref={indicatorRef}
      aria-hidden="true"
      className={`${tone ? "app-rounded" : controlSurfaceStyle({ borderTone: "strong", disabled })} ${tone ? segmentToneStyles[tone].backgroundClassName : ""} ${disabled ? "" : "shadow-sm"} pointer-events-none absolute inset-y-0.5 left-0 opacity-0 transition-[width,transform,opacity,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]`}
    />
  );
}

function SelectionSegmentedControl<T extends string>({
  ariaLabel,
  disabled = false,
  onValueChange,
  options,
  value,
}: Extract<SegmentedControlProps<T>, { behavior: "selection" }>) {
  const { containerRef, indicatorRef } = useSegmentIndicator(value, options);
  const activeTone = options.find(
    (option) => option.value === value && !option.disabled && !disabled
  )?.tone;

  return (
    <div
      ref={(element) => {
        containerRef.current = element;
      }}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className="app-rounded bg-surface-muted dark:aria-disabled:bg-surface-subtle relative inline-flex h-9 shrink-0 items-center"
      role="group"
    >
      <SegmentIndicator
        indicatorRef={indicatorRef}
        tone={activeTone}
        disabled={disabled}
      />
      {options.map(
        ({
          disabled: optionDisabled = false,
          icon,
          label,
          tone,
          value: optionValue,
        }) => {
          const active = value === optionValue;
          const isDisabled = disabled || optionDisabled;

          return (
            <button
              key={optionValue}
              aria-label={label}
              aria-pressed={active}
              className={`group ${segmentClassName(icon)} ${disabledControlTextStyle}`}
              data-segment
              disabled={isDisabled}
              onClick={() => onValueChange(optionValue)}
              type="button"
            >
              <SegmentContent
                active={active}
                disabled={isDisabled}
                icon={icon}
                label={label}
                tone={tone}
              />
            </button>
          );
        }
      )}
    </div>
  );
}

function NavigationSegmentedControl({
  ariaLabel,
  options,
}: Extract<SegmentedControlProps<string>, { behavior: "navigation" }>) {
  const location = useLocation();
  const activeKey = `${location.pathname}${location.search}${location.hash}`;
  const { containerRef, indicatorRef } = useSegmentIndicator(
    activeKey,
    options
  );

  return (
    <nav
      ref={(element) => {
        containerRef.current = element;
      }}
      aria-label={ariaLabel}
      className="app-rounded bg-surface-muted relative inline-flex h-9 shrink-0 items-center"
    >
      <SegmentIndicator indicatorRef={indicatorRef} />
      {options.map(({ end, icon, label, to }) => (
        <NavLink
          key={to}
          aria-label={label}
          className={`group ${segmentClassName(icon)}`}
          data-segment
          end={end}
          to={to}
        >
          {({ isActive }) => (
            <SegmentContent active={isActive} icon={icon} label={label} />
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * 使用例:
 * <SegmentedControl
 *   ariaLabel="表示形式"
 *   behavior="selection"
 *   onValueChange={setViewMode}
 *   options={viewOptions}
 *   value={viewMode}
 * />
 * <SegmentedControl
 *   ariaLabel="ページ切り替え"
 *   behavior="navigation"
 *   options={navigationOptions}
 * />
 */
export function SegmentedControl<T extends string>(
  props: SegmentedControlProps<T>
) {
  if (props.behavior === "selection") {
    return <SelectionSegmentedControl {...props} />;
  }

  if (props.behavior === "navigation") {
    return <NavigationSegmentedControl {...props} />;
  }
}
