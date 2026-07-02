import { cn } from "~/lib/cn";
import { BellIcon } from "lucide-react";

export function NoticeBtn() {
  return (
    <button
      type="button"
      className={cn(
        "app-rounded transition　shadow-(--shadow-soft) relative inline-flex aspect-square h-full cursor-pointer items-center justify-center border",
        "border-(--border-2) bg-transparent text-(--text-2)",
        "hover:border-(--border-strong) hover:bg-(--surface-2) hover:text-(--text-1)"
      )}
      aria-label="Notifications"
    >
      <BellIcon size={15} strokeWidth={1.8} />
      {/* 通知が来ていることを示すランプ要素 */}
      <span className="absolute top-1.5 right-1.75 h-1.75 w-1.75 rounded-full border-[1.5px] border-(--surface-1) bg-(--brand-1)" />
    </button>
  );
}
