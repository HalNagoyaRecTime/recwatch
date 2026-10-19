import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ClassRoomManagementApi } from "~/features/classRoom/api";
import { ClassRoomPage } from "~/features/classRoom/pages/classRoomPage";
import type { ClassRoom } from "~/features/classRoom/model/classRoom";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const firstClassRoom: ClassRoom = {
  classRoomId: 1,
  classCode: "1A",
  className: "1年A組",
  studentCount: 12,
  teacher: null,
};

function createApi(
  overrides: Partial<ClassRoomManagementApi> = {}
): ClassRoomManagementApi {
  return {
    createClassRoom: vi.fn(),
    deleteClassRoom: vi.fn(),
    getClassRoomById: vi.fn(),
    getClassRoomList: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    }),
    updateClassRoom: vi.fn(),
    ...overrides,
  };
}

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <output data-testid="location-pathname">{location.pathname}</output>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

describe("ClassRoomPage", () => {
  it("一覧、検索、ページネーションを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/classrooms"]}>
        <ClassRoomPage
          api={createApi()}
          items={[firstClassRoom]}
          limit={50}
          offset={0}
          onRevalidate={vi.fn()}
          total={51}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("table", { name: "クラス一覧" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "クラスを検索" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "ページネーション" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toHaveAttribute(
      "href",
      "/classrooms/new"
    );
    expect(
      screen.getByRole("button", { name: "ID列の幅を変更" })
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "学生数" })).toHaveClass(
      "justify-start"
    );
    expect(screen.getByText("1年A組")).toBeInTheDocument();
  });

  it("検索とソートをURLへ反映する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/classrooms"]}>
        <ClassRoomPage
          api={createApi()}
          items={[firstClassRoom]}
          limit={50}
          offset={0}
          onRevalidate={vi.fn()}
          total={1}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "クラスコード" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "sortBy=classCode&sortOrder=asc"
      )
    );

    await user.type(
      screen.getByRole("searchbox", { name: "クラスを検索" }),
      "IH13A"
    );
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "search=IH13A"
      )
    );
  });

  it("新規登録リンクは現在の一覧条件を維持する", () => {
    render(
      <MemoryRouter initialEntries={["/classrooms?search=1A&page=2"]}>
        <ClassRoomPage
          api={createApi()}
          items={[]}
          limit={50}
          offset={50}
          onRevalidate={vi.fn()}
          total={100}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "新規登録" })).toHaveAttribute(
      "href",
      "/classrooms/new?search=1A&page=2"
    );
  });

  it("編集actionは検索条件を維持してnested edit Routeへ移動する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/classrooms?search=1A&page=2"]}>
        <ClassRoomPage
          api={createApi()}
          items={[firstClassRoom]}
          limit={50}
          offset={50}
          onRevalidate={vi.fn()}
          total={100}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "クラスを編集する" }));

    expect(screen.getByTestId("location-pathname")).toHaveTextContent(
      "/classrooms/1/edit"
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=1A&page=2"
    );
  });

  it("別のクラスを開くときは前のクラスのページ番号と検索文字を引き継がない", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          "/classrooms?search=1A&page=2&memberPage=3&studentSearch=%E5%B1%B1%E7%94%B0&studentSearchPage=2",
        ]}
      >
        <ClassRoomPage
          api={createApi()}
          items={[firstClassRoom]}
          limit={50}
          offset={50}
          onRevalidate={vi.fn()}
          total={100}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "クラスを編集する" }));

    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=1A&page=2"
    );
    expect(screen.getByTestId("location-search")).not.toHaveTextContent(
      "memberPage"
    );
    expect(screen.getByTestId("location-search")).not.toHaveTextContent(
      "studentSearch"
    );
  });

  it("クラス削除後にRoute loaderを再検証し、空になった最終ページから戻る", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const deleteClassRoom = vi.fn().mockResolvedValue(undefined);
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const api = createApi({ deleteClassRoom });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/classrooms?page=2"]}>
        <ClassRoomPage
          api={api}
          items={[firstClassRoom]}
          limit={50}
          offset={50}
          onRevalidate={onRevalidate}
          total={51}
        />
        <LocationProbe />
      </MemoryRouter>
    );

    const table = screen.getByRole("table", { name: "クラス一覧" });
    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "クラスを削除する" }));

    await waitFor(() => expect(deleteClassRoom).toHaveBeenCalledWith(1));
    await waitFor(() => expect(onRevalidate).toHaveBeenCalledOnce());
    rerender(
      <MemoryRouter initialEntries={["/classrooms?page=2"]}>
        <ClassRoomPage
          api={api}
          items={[]}
          limit={50}
          offset={50}
          onRevalidate={onRevalidate}
          total={50}
        />
        <LocationProbe />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent("")
    );
    expect(within(table).queryByText("1年A組")).not.toBeInTheDocument();
    confirm.mockRestore();
  });
});
