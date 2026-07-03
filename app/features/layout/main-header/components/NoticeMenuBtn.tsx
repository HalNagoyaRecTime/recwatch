import { cn } from "~/lib/cn";
import { BellIcon } from "lucide-react";

type NoticeMenuBtnProps = {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
};

export function NoticeMenuBtn({
  isOpen,
  onToggle,
  unreadCount = 0,
}: NoticeMenuBtnProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "app-rounded relative inline-flex aspect-square h-full cursor-pointer items-center justify-center border shadow-(--shadow-soft) transition",
        isOpen
          ? "border-(--border-strong) bg-(--surface-2) text-(--text-1)"
          : "border-(--border-2) bg-transparent text-(--text-2) hover:border-(--border-strong) hover:bg-(--surface-2) hover:text-(--text-1)"
      )}
      aria-label="Notifications"
    >
      <BellIcon size={15} strokeWidth={1.8} />
      {/* 通知が来ていることを示すランプ要素 */}
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.75 h-1.75 w-1.75 rounded-full border-[1.5px] border-(--surface-1) bg-(--brand-1)" />
      )}
    </button>
  );
}
