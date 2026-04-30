import { EventSwitcherPanel } from "~/features/frame/main-header/event-switcher/components/EventSwitcherPanel";
import { EventSwitcherTrigger } from "~/features/frame/main-header/event-switcher/components/EventSwitcherTrigger";
import { useEventSwitcher } from "~/features/frame/main-header/event-switcher/hooks/useEventSwitcher";
import { getEventSwitcherData } from "~/features/frame/main-header/event-switcher/model/event-switcher-data";

export function EventSwitcherBtn() {
  const events = getEventSwitcherData();
  const { close, isOpen, rootRef, selectedEvent, selectEvent, toggle } =
    useEventSwitcher(events);

  if (!selectedEvent) {
    return null;
  }

  return (
    <div className="relative" ref={rootRef}>
      <EventSwitcherTrigger
        isOpen={isOpen}
        selectedEvent={selectedEvent}
        onToggle={toggle}
      />
      {isOpen ? (
        <EventSwitcherPanel
          events={events}
          onClose={close}
          onSelect={selectEvent}
        />
      ) : null}
    </div>
  );
}
