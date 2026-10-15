import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDebouncedUrlSearch } from "~/hooks/useDebouncedUrlSearch";

function Probe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchInput, setSearchInput } = useDebouncedUrlSearch({
    search: searchParams.get("search") ?? "",
    setSearchParams,
    updateSearch: (current, value) => {
      const next = new URLSearchParams(current);
      next.set("search", value.trim());
      next.delete("page");
      return next.toString();
    },
  });
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <input
        aria-label="検索"
        onChange={(event) => setSearchInput(event.currentTarget.value)}
        value={searchInput}
      />
      <button
        onClick={() =>
          setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set("sortBy", "displayName");
            next.set("sortOrder", "asc");
            return next;
          })
        }
        type="button"
      >
        ソート
      </button>
      <button onClick={() => navigate(-1)} type="button">
        戻る
      </button>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

afterEach(() => vi.useRealTimers());

describe("useDebouncedUrlSearch", () => {
  it("debounce中のsortを保持したままsearchをfunctional updateする", () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={["/students?page=3"]}>
        <Probe />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "検索" }), {
      target: { value: "山田" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ソート" }));

    act(() => vi.advanceTimersByTime(250));

    const params = new URLSearchParams(
      screen.getByTestId("location-search").textContent ?? ""
    );
    expect(params.get("search")).toBe("山田");
    expect(params.get("sortBy")).toBe("displayName");
    expect(params.get("sortOrder")).toBe("asc");
    expect(params.has("page")).toBe(false);
  });

  it("browser backでURLのsearchへ入力欄を同期する", async () => {
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
