import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { CompetitionCreatePage } from "./CompetitionCreatePage";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("CompetitionCreatePage", () => {
  it("submits the shared form through the event API contract", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/new"]}>
        <CompetitionCreatePage
          api={{ create, get: vi.fn(), update: vi.fn() }}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "イベントの新規登録" })
    ).toBeInTheDocument();
    expect(screen.queryByText("表示プレビュー")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("イベント名*"), "大縄跳び");
    await user.type(screen.getByLabelText("実施場所*"), "運動場");
    await user.type(screen.getByLabelText("開始時間*"), "09:30");
    await user.type(screen.getByLabelText("終了時間*"), "10:00");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        endTime: "10:00",
        name: "大縄跳び",
        rules: null,
        startTime: "09:30",
        venue: "運動場",
      })
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/events");
  });
});
