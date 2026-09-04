import { XIcon } from "lucide-react";

import { cn } from "~/lib/cn";

import { useSidebarUI } from "~/features/frame/sidebar/hooks/useSidebarUI";
import { SIDEBAR_DURATION } from "~/features/frame/sidebar/styles/sidebar-styles";

type SidebarHeaderProps = {
  onClose?: () => void;
};

export function SidebarHeader({ onClose }: SidebarHeaderProps) {
  const { isExpanded } = useSidebarUI();

  return (
    <div
      className={cn(
        "main-header-height border-border-subtle flex items-center gap-3 border-b pl-4",
        onClose && "justify-between pr-3"
      )}
    >
      <a href="/" className="flex cursor-pointer items-center gap-2">
        <img
          src="/recwatch-logo.svg"
          alt="recwatch"
          className="aspect-square h-6"
        />
        <span
          className={cn(
            "overflow-hidden text-base font-semibold tracking-[0.02em] whitespace-nowrap transition-[max-width,opacity]",
            SIDEBAR_DURATION,
            isExpanded ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
          )}
        >
          rec<em className="text-brand-primary not-italic">watch</em>
        </span>
      </a>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="サイドメニューを閉じる"
          className={cn(
            "app-rounded text-text-muted flex size-9 shrink-0 cursor-pointer items-center justify-center bg-transparent transition",
            "hover:bg-surface-hover hover:text-text-base"
          )}
        >
          <XIcon size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
