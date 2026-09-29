import type { ReactNode, Ref } from "react";
import { cn } from "~/lib/cn";

type SearchShellProps = {
  children: ReactNode;
  rootRef?: Ref<HTMLDivElement>;
  isOpen: boolean;
  geometryTransitionEnabled: boolean;
};

export function SearchShell({
  children,
  rootRef,
  isOpen,
  geometryTransitionEnabled,
}: SearchShellProps) {
  return (
    <div
      ref={rootRef}
      data-search-surface
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? true : undefined}
      aria-label={isOpen ? "画面検索" : undefined}
      tabIndex={isOpen ? -1 : undefined}
      className={cn(
        "app-rounded shadow-soft relative flex h-full flex-col overflow-hidden border border-transparent motion-reduce:transition-none",
        geometryTransitionEnabled
          ? "transition-[padding,background-color,border-color] duration-400 ease-in-out"
          : "transition-none",
        isOpen
          ? "border-border-base bg-surface-base p-3 md:p-5"
          : "bg-transparent p-0"
      )}
    >
      {children}
    </div>
  );
}
