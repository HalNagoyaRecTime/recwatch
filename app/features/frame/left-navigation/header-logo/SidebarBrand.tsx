import { cn } from "~/lib/cn";

import { useLeftNavigationExpanded } from "~/features/frame/left-navigation/hooks/useLeftNavigationExpanded";

export function SidebarBrand() {
  const isExpanded = useLeftNavigationExpanded();

  return (
    <div className="main-header-height hidden items-center gap-3 border-b border-(--border-1) pl-4 md:flex">
      <a href="/" className="flex cursor-pointer items-center gap-2">
        <img
          src="/recwatch-logo.svg"
          alt="recwatch"
          className="aspect-square h-6"
        />
        <span
          className={cn(
            "overflow-hidden text-base font-semibold tracking-[0.02em] whitespace-nowrap transition-[max-width,opacity] duration-200",
            isExpanded ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
          )}
        >
          rec<em className="text-(--brand-1) not-italic">watch</em>
        </span>
      </a>
    </div>
  );
}
