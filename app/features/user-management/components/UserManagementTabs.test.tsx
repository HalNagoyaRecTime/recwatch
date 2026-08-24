import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { UserManagementTabs } from "./UserManagementTabs";

describe("UserManagementTabs", () => {
  it.each([
    ["students", "学生管理", ["クラス管理", "教官管理"]],
    ["classrooms", "クラス管理", ["学生管理", "教官管理"]],
    ["teachers", "教官管理", ["学生管理", "クラス管理"]],
  ] as const)(
    "provides all destinations from the %s screen",
    (active, label, inactiveLabels) => {
      render(
        <MemoryRouter>
          <UserManagementTabs active={active} />
        </MemoryRouter>
      );

      expect(
        screen.getByRole("navigation", { name: "ユーザー" })
      ).toBeInTheDocument();
      expect(screen.getByText(label)).toHaveAttribute("aria-current", "page");
      for (const inactiveLabel of inactiveLabels) {
        expect(
          screen.getByRole("link", { name: inactiveLabel })
        ).toBeInTheDocument();
      }
    }
  );
});
