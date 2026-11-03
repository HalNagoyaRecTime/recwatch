import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  SearchCombobox,
  type SearchOption,
} from "~/components/ui/form/SearchCombobox";

const options: SearchOption[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1),
  label: `対応ラウンド ${index + 1}`,
  description: `ID: ${index + 1}`,
}));

function SearchComboboxHarness({
  onOptionSelect,
  searchOptions = options,
}: {
  onOptionSelect: (option: SearchOption) => void;
  searchOptions?: SearchOption[];
}) {
  const [query, setQuery] = useState("対応ラウンド");

  return (
    <div data-testid="overflow-hidden-parent" className="overflow-hidden">
      <SearchCombobox
        ariaLabel="集合を検索して追加"
        onOptionSelect={onOptionSelect}
        onQueryChange={setQuery}
        options={searchOptions}
        query={query}
      />
    </div>
  );
}

describe("SearchCombobox", () => {
  it("候補を親のoverflow領域外へ表示し、5件目以降もスクロール領域から選択できる", async () => {
    const user = userEvent.setup();
    const onOptionSelect = vi.fn();

    render(<SearchComboboxHarness onOptionSelect={onOptionSelect} />);

    await user.click(
      screen.getByRole("combobox", { name: "集合を検索して追加" })
    );

    const listbox = screen.getByRole("listbox", {
      name: "集合を検索して追加の候補",
    });
    const floatingSurface = listbox.parentElement;

    expect(screen.getByTestId("overflow-hidden-parent")).not.toContainElement(
      listbox
    );
    expect(listbox).toHaveClass("overflow-y-auto");
    expect(floatingSurface).toHaveClass(
      "max-h-(--search-combobox-available-height)"
    );
    await waitFor(() =>
      expect(
        floatingSurface?.style.getPropertyValue(
          "--search-combobox-available-height"
        )
      ).toMatch(/px$/)
    );
    expect(screen.getAllByRole("option")).toHaveLength(6);

    await user.click(screen.getByRole("option", { name: /対応ラウンド 6/ }));

    expect(onOptionSelect).toHaveBeenCalledWith(options[5]);
  });

  it("候補が少ない場合も従来どおり選択できる", async () => {
    const user = userEvent.setup();
    const onOptionSelect = vi.fn();

    render(
      <SearchComboboxHarness
        onOptionSelect={onOptionSelect}
        searchOptions={options.slice(0, 2)}
      />
    );

    await user.click(
      screen.getByRole("combobox", { name: "集合を検索して追加" })
    );
    expect(screen.getAllByRole("option")).toHaveLength(2);

    await user.click(screen.getByRole("option", { name: /対応ラウンド 2/ }));

    expect(onOptionSelect).toHaveBeenCalledWith(options[1]);
  });
});
