import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { NavLink, useLocation } from "react-router";

import { controlSurfaceStyle } from "~/components/ui/form/styles/control-styles";

type SegmentBase = {
  icon?: LucideIcon;
  label: string;
};

type SelectionSegment<T extends string> = SegmentBase & {
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
};

const segmentClassName = (icon: LucideIcon | undefined) =>
  `app-rounded relative z-10 flex h-full cursor-pointer items-center justify-center ${
    icon === undefined ? "min-w-9 px-3" : "aspect-square"
  }`;

function SegmentContent({ active, icon: Icon, label }: SegmentContentProps) {
  return (
    <span
      className={`flex items-center justify-center text-sm transition-colors duration-200 ${
        active
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
}: {
  indicatorRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span
      ref={indicatorRef}
      aria-hidden="true"
      className={`${controlSurfaceStyle({ borderTone: "strong" })} pointer-events-none absolute inset-y-0.5 left-0 opacity-0 shadow-sm transition-[width,transform,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]`}
    />
  );
}

function SelectionSegmentedControl<T extends string>({
  ariaLabel,
  onValueChange,
  options,
  value,
}: Extract<SegmentedControlProps<T>, { behavior: "selection" }>) {
  const { containerRef, indicatorRef } = useSegmentIndicator(value, options);

  return (
    <div
      ref={(element) => {
        containerRef.current = element;
      }}
      aria-label={ariaLabel}
      className="app-rounded bg-surface-muted relative inline-flex h-9 shrink-0 items-center"
      role="group"
    >
      <SegmentIndicator indicatorRef={indicatorRef} />
      {options.map(({ icon, label, value: optionValue }) => {
        const active = value === optionValue;

        return (
          <button
            key={optionValue}
            aria-label={label}
            aria-pressed={active}
            className={`group ${segmentClassName(icon)}`}
            data-segment
            onClick={() => onValueChange(optionValue)}
            type="button"
          >
            <SegmentContent active={active} icon={icon} label={label} />
          </button>
        );
      })}
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
