import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useClassRoomMembershipUrl } from "~/features/students/hooks/useClassRoomMembershipUrl";

function Probe() {
  const { searchInput, setSearchInput } = useClassRoomMembershipUrl();
  const location = useLocation();

  return (
    <>
      <input
        aria-label="検索"
        onChange={(event) => setSearchInput(event.currentTarget.value)}
        value={searchInput}
      />
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

afterEach(() => vi.useRealTimers());

describe("useClassRoomMembershipUrl", () => {
  it("連続入力しても文字が失われず、空白を含む最後の入力だけをURLに反映する", () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={["/classrooms/12/edit?memberPage=2"]}>
        <Probe />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox", { name: "検索" });
    fireEvent.change(input, { target: { value: "山" } });
    fireEvent.change(input, { target: { value: "山田" } });
    fireEvent.change(input, { target: { value: "山田 花子" } });
    expect(input).toHaveValue("山田 花子");

    act(() => vi.advanceTimersByTime(250));
    const params = new URLSearchParams(
      screen.getByTestId("location-search").textContent ?? ""
    );
    expect(params.get("studentSearch")).toBe("山田 花子");
    expect(params.get("memberPage")).toBe("2");
  });
});
