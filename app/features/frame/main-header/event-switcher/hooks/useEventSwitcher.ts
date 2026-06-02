import { useEffect, useRef, useState } from "react";

import type { EventSwitcherItem } from "~/features/frame/main-header/event-switcher/model/event-switcher-data";

export function useEventSwitcher(events: EventSwitcherItem[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedEvent =
    events.find((event) => event.id === selectedId) ?? events[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return {
    close: () => setIsOpen(false),
    isOpen,
    rootRef,
    selectedEvent,
    selectEvent: (eventId: string) => {
      setSelectedId(eventId);
      setIsOpen(false);
    },
    toggle: () => setIsOpen((value) => !value),
  };
}
