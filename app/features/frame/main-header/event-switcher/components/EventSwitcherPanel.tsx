import { MenuActionButton } from "~/components/ui/MenuActionButton";
import type { EventSwitcherItem } from "~/features/frame/main-header/event-switcher/model/event-switcher-data";

type EventSwitcherPanelProps = {
  events: EventSwitcherItem[];
  onClose: () => void;
  onSelect: (eventId: string) => void;
};

export function EventSwitcherPanel({
  events,
  onSelect,
}: EventSwitcherPanelProps) {
  return (
    <div className="absolute top-[calc(100%+6px)] left-0 z-120 min-w-full rounded-xl border border-(--border-2) bg-(--surface-overlay-strong) p-1.5 shadow-(--shadow-soft) backdrop-blur-xl">
      {events.map((event) => (
        <MenuActionButton
          key={event.id}
          content={
            <>
              <span className="app-text-small max-w-100 overflow-hidden text-ellipsis whitespace-nowrap">
                {event.name}
              </span>
            </>
          }
          onClick={() => onSelect(event.id)}
        />
      ))}
    </div>
  );
}
