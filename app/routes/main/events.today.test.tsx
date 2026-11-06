import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import EventsTodayRoute from "./events.today";

afterEach(cleanup);

function LocationProbe() {
  const { pathname } = useLocation();
  return <div>{pathname}</div>;
}

describe("events.today", () => {
  it("イベント一覧へリダイレクトする", async () => {
    render(
      <MemoryRouter initialEntries={["/events/today"]}>
        <EventsTodayRoute />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(await screen.findByText("/events")).toBeInTheDocument();
  });
});
