import { CalendarClockIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "~/lib/cn";
import type { EventSwitcherItem } from "~/features/frame/main-header/event-switcher/model/event-switcher-data";

type EventSwitcherTriggerProps = {
  isOpen: boolean;
  selectedEvent: EventSwitcherItem;
  onToggle: () => void;
};

export function EventSwitcherTrigger({
  isOpen,
  selectedEvent,
  onToggle,
}: EventSwitcherTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "app-rounded inline-flex h-full cursor-pointer items-center gap-1.75 border px-2.75 py-1.25 text-xs font-semibold transition",
        "border-(--border-2) bg-transparent text-(--text-1)",
        "hover:border-(--border-strong) hover:bg-(--surface-2)",
        isOpen ? "border-(--border-strong) bg-(--surface-2)" : ""
      )}
      onClick={onToggle}
    >
      <CalendarClockIcon size={14} strokeWidth={1.8} />
      <span className="app-text-small max-w-50 overflow-hidden text-ellipsis whitespace-nowrap">
        {selectedEvent.name}
      </span>
      <ChevronDownIcon
        size={14}
        strokeWidth={1.8}
        className="text-(--text-3)"
      />
    </button>
  );
}
