import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "~/components/ui/form/Select";

const options = Array.from({ length: 100 }, (_, index) => ({
  label: `クラス ${index + 1}`,
  value: String(index + 1),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Select", () => {
  it("多数の候補を高さ制限付きの領域に表示し、末尾の候補を選択できる", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        ariaLabel="クラス"
        options={options}
        value="1"
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "クラス" });
    await user.click(trigger);
    const listbox = screen.getByRole("listbox", { name: "クラス" });
    expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    expect(listbox.querySelector(".scrollbar-none")).toBeInTheDocument();
    await waitFor(() => {
      const height = Number.parseFloat(
        listbox.style.getPropertyValue("--floating-panel-available-height")
      );
      expect(height).toBeGreaterThanOrEqual(0);
      expect(height).toBeLessThanOrEqual(360);
    });
    expect(listbox).toHaveStyle({ position: "fixed" });
    await user.click(screen.getByRole("option", { name: /^クラス 100$/ }));
    expect(onValueChange).toHaveBeenCalledWith("100");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("初期選択とキー移動を候補内へ表示し、外側のスクロール位置を変えない", async () => {
    const originalBounds = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains("scrollbar-none")) {
          return new DOMRect(20, 90, 200, 144);
        }
        if (this.getAttribute("role") === "option") {
          const index = Number(this.id.split("-option-").at(-1));
          const viewport = this.closest<HTMLElement>(".scrollbar-none");
          return new DOMRect(
            20,
            90 + index * 36 - (viewport?.scrollTop ?? 0),
            200,
            36
          );
        }
        return originalBounds.call(this);
      }
    );
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <main data-testid="outer-scroll">
        <Select
          ariaLabel="クラス"
          options={options}
          value="80"
          onValueChange={onValueChange}
        />
      </main>
    );
    const outer = screen.getByTestId("outer-scroll");
    outer.scrollTop = 120;
    const trigger = screen.getByRole("combobox", { name: "クラス" });
    await user.click(trigger);
    const listbox = screen.getByRole("listbox", { name: "クラス" });
    const viewport = listbox.querySelector<HTMLElement>(".scrollbar-none")!;
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    const initialTop = viewport.scrollTop;
    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: /^クラス 80$/ }).id
    );
    expect(outer.scrollTop).toBe(120);

    await user.keyboard("{ArrowDown}");
    expect(viewport.scrollTop).toBeGreaterThan(initialTop);
    expect(outer.scrollTop).toBe(120);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("81");
    expect(trigger).toHaveFocus();
  });

  it("Escapeで選択を変えずに閉じる", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        ariaLabel="クラス"
        options={options.slice(0, 2)}
        value="1"
        onValueChange={onValueChange}
      />
    );
    const trigger = screen.getByRole("combobox", { name: "クラス" });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });
});
