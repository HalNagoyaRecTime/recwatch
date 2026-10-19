import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { EventListItem } from "~/features/events/model/event-list-item";
import { EventListPage } from "./EventListPage";

const event: EventListItem = {
  id: 1,
  code: "001",
  name: "大縄跳び",
  venues: [{ id: 1, name: "第2体育館" }],
  startTime: "09:30",
  endTime: "10:00",
  gatheringSummary: {
    gatheringCount: 2,
    configuredGatheringCount: 1,
    firstGatheringTime: "09:00",
  },
  rules: "3分間",
};

const anotherEvent: EventListItem = {
  ...event,
  id: 2,
  code: "002",
  name: "リレー",
  venues: [
    { id: 2, name: "第1体育館" },
    { id: 3, name: "中庭" },
  ],
};

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("EventListPage", () => {
  it("uses shared page, search, button, and table components", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <EventListPage
          gateway={{
            load: vi.fn().mockResolvedValue([event]),
            delete: vi.fn(),
          }}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "イベント一覧" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "イベントを検索" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "イベント一覧" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toHaveAttribute(
      "href",
      "/events/new"
    );
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: event.name })
    ).not.toBeInTheDocument();

    // 行からは詳細と削除だけを行い、編集・集合設定はイベント詳細から行う
    expect(screen.getByRole("button", { name: "詳細" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${event.name}を削除` })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `${event.name}の操作` })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "詳細" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      new RegExp(`/events/${event.id}$`)
    );
  });

  it("ID でも検索できる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <EventListPage
          gateway={{
            load: vi.fn().mockResolvedValue([anotherEvent, event]),
            delete: vi.fn(),
          }}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", { name: "イベント一覧" });
    await user.type(
      screen.getByRole("searchbox", { name: "イベントを検索" }),
      event.code
    );
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText(event.name)).toBeInTheDocument();
  });

  it("いずれかの実施場所に一致するイベントを検索できる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <EventListPage
          gateway={{
            load: vi.fn().mockResolvedValue([event, anotherEvent]),
            delete: vi.fn(),
          }}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", { name: "イベント一覧" });
    expect(within(table).getByText("第1体育館、中庭")).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "イベントを検索" }),
      "中庭"
    );
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText(anotherEvent.name)).toBeInTheDocument();
  });

  it("実施場所は先頭の実施場所で並び替える", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <EventListPage
          gateway={{
            load: vi.fn().mockResolvedValue([event, anotherEvent]),
            delete: vi.fn(),
          }}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", { name: "イベント一覧" });
    await user.click(screen.getByRole("button", { name: "実施場所" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("リレー");

    await user.click(screen.getByRole("button", { name: "実施場所" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("大縄跳び");
  });

  it("イベントをソートし、行の削除ボタンから削除する", async () => {
    const deleteEvent = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <EventListPage
          gateway={{
            load: vi.fn().mockResolvedValue([anotherEvent, event]),
            delete: deleteEvent,
          }}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", { name: "イベント一覧" });
    await user.click(screen.getByRole("button", { name: "ID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("大縄跳び");

    await user.click(screen.getByRole("button", { name: "ID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("リレー");

    await user.click(screen.getByRole("button", { name: "リレーを削除" }));

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith(2));
    expect(screen.queryByText("リレー")).not.toBeInTheDocument();
  });
});
