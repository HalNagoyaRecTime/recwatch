import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { TeamActionMenu } from "~/features/team/components/TeamActionMenu";
import type { Team } from "~/features/team/model/team";

const team: Team = {
  id: 3,
  name: "赤組",
  registeredClasses: ["1A"],
  score: 0,
  registeredAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};

function renderMenu(overrides: Partial<Team> = {}) {
  const onDeleteRequest = vi.fn();
  render(
    <MemoryRouter>
      <TeamActionMenu
        onDeleteRequest={onDeleteRequest}
        search=""
        team={{ ...team, ...overrides }}
      />
    </MemoryRouter>
  );
  return onDeleteRequest;
}

describe("TeamActionMenu", () => {
  it("得点が0のチームは削除を依頼できる", async () => {
    const onDeleteRequest = renderMenu({ score: 0 });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "赤組の操作" }));
    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(onDeleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3 })
    );
  });

  it.each([10, -5])(
    "得点が%iのチームはAPIで削除できないため、理由を示して選べなくする",
    async (score) => {
      const onDeleteRequest = renderMenu({ score });
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "赤組の操作" }));
      const deleteButton = screen.getByRole("button", {
        name: "削除（得点があるため不可）",
      });

      expect(deleteButton).toBeDisabled();
      await user.click(deleteButton);
      expect(onDeleteRequest).not.toHaveBeenCalled();
    }
  );
});
