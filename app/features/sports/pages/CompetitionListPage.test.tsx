import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";
import { CompetitionListPage } from "./CompetitionListPage";

const competition: CompetitionListItem = {
  id: 1,
  code: "001",
  name: "大縄跳び",
  venue: "運動場",
  meetingTime: "09:00",
  startTime: "09:30",
  endTime: "10:00",
  meetingPlace: "正門",
  rules: "3分間",
};

const anotherCompetition: CompetitionListItem = {
  ...competition,
  id: 2,
  code: "002",
  name: "リレー",
};

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("CompetitionListPage", () => {
  it("uses shared page, search, button, and table components", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <CompetitionListPage
          gateway={{
            load: vi.fn().mockResolvedValue([competition]),
            delete: vi.fn(),
          }}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "イベント登録一覧" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "イベントを検索" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "イベント登録一覧" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toHaveAttribute(
      "href",
      "/events/new"
    );
    expect(screen.queryByText("イベント詳細")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: competition.name })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${competition.name}の操作` })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: `${competition.name}の操作` })
    );
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      `/events/${competition.id}/edit`
    );
  });

  it("イベントをソートし、3点メニューから削除する", async () => {
    const deleteEvent = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CompetitionListPage
          gateway={{
            load: vi.fn().mockResolvedValue([anotherCompetition, competition]),
            delete: deleteEvent,
          }}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", {
      name: "イベント登録一覧",
    });
    await user.click(screen.getByRole("button", { name: "イベントID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("大縄跳び");

    await user.click(screen.getByRole("button", { name: "イベントID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("リレー");

    await user.click(screen.getByRole("button", { name: "リレーの操作" }));
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteEvent).toHaveBeenCalledWith(2));
    expect(screen.queryByText("リレー")).not.toBeInTheDocument();
  });
});
