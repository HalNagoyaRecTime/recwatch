import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useClassRoomListUrl } from "~/features/classRoom/hooks/useClassRoomListUrl";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function UrlProbe() {
  const { handleSortChange, searchInput, setSearchInput } =
    useClassRoomListUrl();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <input
        aria-label="検索"
        onChange={(event) => setSearchInput(event.currentTarget.value)}
        value={searchInput}
      />
      <button onClick={() => handleSortChange("class-room-code")} type="button">
        ソート
      </button>
      <button onClick={() => navigate("/classroom")} type="button">
        検索条件を消去
      </button>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

describe("useClassRoomListUrl", () => {
  it("検索のdebounce中にソートしても最新のQueryを保持する", () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={["/classroom"]}>
        <UrlProbe />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "検索" }), {
      target: { value: "IH13A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ソート" }));

    act(() => vi.advanceTimersByTime(250));

    const params = new URLSearchParams(
      screen.getByTestId("location-search").textContent ?? ""
    );
    expect(params.get("search")).toBe("IH13A");
    expect(params.get("sortBy")).toBe("classCode");
    expect(params.get("sortOrder")).toBe("asc");
  });

  it("URLの検索条件が変わったら入力値を同期する", async () => {
    render(
      <MemoryRouter initialEntries={["/classroom?search=IH13A"]}>
        <UrlProbe />
      </MemoryRouter>
    );

    expect(screen.getByRole("textbox", { name: "検索" })).toHaveValue("IH13A");
    fireEvent.click(screen.getByRole("button", { name: "検索条件を消去" }));

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "検索" })).toHaveValue("")
    );
  });
});
