import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { EventGatheringSettingsPage } from "~/features/event-gatherings/pages/EventGatheringSettingsPage";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderPage(path: string, load = vi.fn(), save = vi.fn()) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          element={
            <EventGatheringSettingsPage
              memberGateway={{ loadCandidates: vi.fn(), saveMembers: vi.fn() }}
              settingsGateway={{ load, save }}
              spotGateway={{
                list: vi.fn().mockResolvedValue({
                  items: [],
                  total: 0,
                  limit: 0,
                  offset: 0,
                }),
                getById: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
              }}
            />
          }
          path="/events/:competitionId/gatherings"
        />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("EventGatheringSettingsPage", () => {
  it("URL のイベント ID で集合設定を読み込み、保存後に一覧へ戻る", async () => {
    const load = vi.fn().mockResolvedValue({ eventId: 7, rounds: [] });
    const save = vi.fn().mockResolvedValue({ eventId: 7, rounds: [] });
    const user = userEvent.setup();
    renderPage("/events/7/gatherings", load, save);

    expect(
      screen.getByRole("heading", { name: "集合設定", level: 2 })
    ).toBeInTheDocument();
    await waitFor(() => expect(load).toHaveBeenCalledWith(7));

    await user.click(
      await screen.findByRole("button", { name: "集合設定を保存" })
    );
    await waitFor(() => expect(save).toHaveBeenCalledWith(7, { rounds: [] }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/events$/)
    );
  });

  it("不正なイベント ID では読み込まずエラーを表示する", () => {
    const load = vi.fn();
    renderPage("/events/not-a-number/gatherings", load);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "イベントIDが不正です。"
    );
    expect(load).not.toHaveBeenCalled();
  });
});
