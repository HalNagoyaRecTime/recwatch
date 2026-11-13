import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { AdminNotificationListSchedule } from "~/features/notifications/api/contracts/admin-notification-query-api";
import { NotificationAudienceSummary } from "~/features/notifications/components/list/NotificationAudienceSummary";

const schedule = {
  status: "scheduled",
  audience: {
    items: Array.from({ length: 60 }, (_, index) => ({
      type: "class_room",
      targetId: index + 1,
      label: `クラス${index + 1}`,
    })),
    recipientResolution: { status: "pending" },
  },
} as unknown as AdminNotificationListSchedule;

describe("NotificationAudienceSummary", () => {
  it("対象が多くても、画面に収まる高さで中をスクロールできる", async () => {
    render(<NotificationAudienceSummary schedule={schedule} />);

    await userEvent.click(
      screen.getByRole("button", { name: "60件の対象指定" })
    );

    const panel = screen.getByRole("dialog");
    expect(
      panel.style.getPropertyValue("--floating-panel-available-height")
    ).toMatch(/px$/);
    expect(panel.firstElementChild).toHaveClass(
      "max-h-[var(--floating-panel-available-height)]"
    );
    expect(screen.getByText("クラス：クラス60")).toBeInTheDocument();
  });
});
