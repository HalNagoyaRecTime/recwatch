import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { EventTimeRegistrationPage } from "./EventTimeRegistrationPage";

describe("EventTimeRegistrationPage", () => {
  it("shows the page heading before an event is selected", async () => {
    render(
      <MemoryRouter>
        <EventTimeRegistrationPage
          gateway={{
            list: vi.fn().mockResolvedValue([]),
            get: vi.fn().mockRejectedValue(new Error("not used")),
            cancelNotification: vi
              .fn()
              .mockRejectedValue(new Error("not used")),
          }}
          eventNotificationGateway={{
            patchEvent: vi.fn().mockRejectedValue(new Error("not used")),
            getNotificationSummary: vi
              .fn()
              .mockRejectedValue(new Error("not used")),
          }}
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "スケジュールの新規登録" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/対象イベント/)).toBeInTheDocument();
  });
});
