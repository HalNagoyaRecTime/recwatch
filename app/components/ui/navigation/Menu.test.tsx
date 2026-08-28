import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";

describe("Menu", () => {
  it("disabledの操作項目を機能と見た目の両方で無効化する", () => {
    render(
      <Menu
        items={[
          {
            disabled: true,
            id: "delete",
            label: "削除",
            onClick: vi.fn(),
            type: "action",
          },
        ]}
      />
    );

    const button = screen.getByRole("button", { name: "削除" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:pointer-events-none",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50"
    );
  });
});
