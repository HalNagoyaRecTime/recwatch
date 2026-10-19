import { cn } from "~/lib/cn";
import { BellIcon } from "lucide-react";

export function NoticeBtn() {
  return (
    <button
      type="button"
      className={cn(
        "app-rounded shadow-soft relative inline-flex aspect-square h-full cursor-pointer items-center justify-center border transition",
        "border-border-base text-text-muted bg-transparent",
        "hover:border-border-strong hover:bg-surface-hover hover:text-text-base"
      )}
      aria-label="Notifications"
    >
      <BellIcon size={15} strokeWidth={1.8} />
      {/* 通知が来ていることを示すランプ要素 */}
      <span className="border-surface-base bg-brand-primary absolute top-1.5 right-1.75 h-1.75 w-1.75 rounded-full border-[1.5px]" />
    </button>
  );
}
