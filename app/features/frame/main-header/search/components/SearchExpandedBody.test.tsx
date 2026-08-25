import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchExpandedBody } from "~/features/frame/main-header/search/components/SearchExpandedBody";

describe("SearchExpandedBody", () => {
  it("removes closed search results from keyboard and screen-reader access", () => {
    render(
      <SearchExpandedBody isOpen={false}>
        <button type="button">検索結果</button>
      </SearchExpandedBody>
    );

    const container = screen.getByText("検索結果").parentElement?.parentElement;
    expect(container).toHaveAttribute("inert");
    expect(container).toHaveAttribute("aria-hidden", "true");
  });

  it("makes opened search results interactive", () => {
    render(
      <SearchExpandedBody isOpen>
        <button type="button">検索結果</button>
      </SearchExpandedBody>
    );

    const container = screen.getByText("検索結果").parentElement?.parentElement;
    expect(container).not.toHaveAttribute("inert");
    expect(container).not.toHaveAttribute("aria-hidden");
  });
});
