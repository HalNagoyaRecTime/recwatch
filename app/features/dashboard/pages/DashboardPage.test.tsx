import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("競技管理のリンクをevents配下へ遷移させる", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const destinations = [
      ["競技一覧", "/events"],
      ["競技登録", "/events/new"],
      ["競技編集", "/events/2/edit"],
      ["競技割り当て", "/events/assignments"],
    ] as const;

    for (const [label, destination] of destinations) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        destination
      );
    }
  });
});
