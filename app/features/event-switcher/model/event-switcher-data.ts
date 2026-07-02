import eventSwitcherMock from "~/mock/frame/event-switcher.json";

type EventSwitcherMockItem = {
  number: number;
  name: string;
};

export type EventSwitcherItem = {
  id: string;
  number: number;
  name: string;
};

type EventSwitcherMock = {
  events: EventSwitcherMockItem[];
};

function toEventSwitcherItem(event: EventSwitcherMockItem): EventSwitcherItem {
  return {
    id: `event-${event.number}`,
    number: event.number,
    name: event.name,
  };
}

export function getEventSwitcherData(): EventSwitcherItem[] {
  const { events } = eventSwitcherMock as EventSwitcherMock;

  return events.map(toEventSwitcherItem);
}
