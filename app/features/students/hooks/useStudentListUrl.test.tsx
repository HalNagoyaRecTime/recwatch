import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useStudentListUrl } from "~/features/students/hooks/useStudentListUrl";

function Probe() {
  const { handleFilterChange, handleSortChange, searchInput, setSearchInput } =
    useStudentListUrl();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <input
        aria-label="検索"
        onChange={(event) => setSearchInput(event.currentTarget.value)}
        value={searchInput}
      />
      <button onClick={() => handleSortChange("display-name")} type="button">
        ソート
      </button>
      <button
        onClick={() => handleFilterChange("isStaff", "true")}
        type="button"
      >
        フィルター
      </button>
      <button onClick={() => navigate(-1)} type="button">
        戻る
      </button>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

afterEach(() => vi.useRealTimers());

describe("useStudentListUrl", () => {
  it("initial URL、debounce、sort/filter競合、page resetを処理する", () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={["/students?page=3&isLiveActive=false"]}>
        <Probe />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "検索" }), {
      target: { value: "山田" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ソート" }));
    fireEvent.click(screen.getByRole("button", { name: "フィルター" }));
    act(() => vi.advanceTimersByTime(250));

    const params = new URLSearchParams(
      screen.getByTestId("location-search").textContent ?? ""
    );
    expect(params.get("search")).toBe("山田");
    expect(params.get("sortBy")).toBe("displayName");
    expect(params.get("isStaff")).toBe("true");
    expect(params.get("isLiveActive")).toBe("false");
    expect(params.has("page")).toBe(false);
  });

  it("browser back/forwardのURLをinputへ同期する", async () => {
    render(
      <MemoryRouter
        initialEntries={["/students?search=A", "/students?search=B"]}
      >
        <Probe />
      </MemoryRouter>
    );

    expect(screen.getByRole("textbox", { name: "検索" })).toHaveValue("B");
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "検索" })).toHaveValue("A")
    );
  });
});
