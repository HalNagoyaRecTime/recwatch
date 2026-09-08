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
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const firstClassRoom: ClassRoomData = {
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
  return <output data-testid="location-search">{location.search}</output>;
}

describe("ClassRoomPage", () => {
  it("一覧、検索、ページネーションを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/classroom"]}>
        <ClassRoomPage
          classRooms={[firstClassRoom]}
          teacherOptions={[]}
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
    expect(screen.getByText("1年A組")).toBeInTheDocument();
  });

  it("検索とソートをURLへ反映する", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/classroom"]}>
        <ClassRoomPage classRooms={[firstClassRoom]} teacherOptions={[]} />
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

  it("クラスを登録した後は現在の一覧条件で再取得する", async () => {
    const user = userEvent.setup();
    const created: ClassRoomData = {
      classRoomId: 2,
      classCode: "1B",
      className: "1年B組",
      studentCount: 0,
      teacher: null,
    };
    const getClassRoomList = vi.fn().mockResolvedValue({
      items: [created],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const createClassRoom = vi.fn().mockResolvedValue(created);
    const api = createApi({ createClassRoom, getClassRoomList });

    render(
      <MemoryRouter initialEntries={["/classroom?search=1A&page=2"]}>
        <ClassRoomPage
          api={api}
          classRooms={[]}
          teacherOptions={[]}
          total={100}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "クラスコード*" }),
      "1B"
    );
    await user.type(
      screen.getByRole("textbox", { name: "クラス名*" }),
      "1年B組"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(createClassRoom).toHaveBeenCalledWith({
        classCode: "1B",
        className: "1年B組",
        teacherId: null,
      })
    );
    await waitFor(() =>
      expect(getClassRoomList).toHaveBeenCalledWith({
        limit: 50,
        offset: 50,
        search: "1A",
        sortBy: undefined,
        sortOrder: undefined,
      })
    );
    expect(await screen.findByText("1年B組")).toBeInTheDocument();
  });

  it("既存クラスを編集して更新後に一覧を再取得する", async () => {
    const user = userEvent.setup();
    const updated: ClassRoomData = {
      ...firstClassRoom,
      classCode: "2A",
      className: "2年A組",
      teacher: { teacherId: 8, userId: 80, displayName: "鈴木教官" },
    };
    const updateClassRoom = vi.fn().mockResolvedValue(updated);
    const getClassRoomList = vi.fn().mockResolvedValue({
      items: [updated],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const api = createApi({ updateClassRoom, getClassRoomList });

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={api}
          classRooms={[firstClassRoom]}
          teacherOptions={[{ teacherId: 8, displayName: "鈴木教官" }]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "クラスを編集する" }));
    await user.clear(screen.getByRole("textbox", { name: "クラスコード*" }));
    await user.type(
      screen.getByRole("textbox", { name: "クラスコード*" }),
      "2A"
    );
    await user.clear(screen.getByRole("textbox", { name: "クラス名*" }));
    await user.type(
      screen.getByRole("textbox", { name: "クラス名*" }),
      "2年A組"
    );
    await user.selectOptions(screen.getByLabelText("担当教官"), "8");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(updateClassRoom).toHaveBeenCalledWith(1, {
        classCode: "2A",
        className: "2年A組",
        teacherId: 8,
      })
    );
    expect(await screen.findByText("2年A組")).toBeInTheDocument();
    expect(screen.queryByText("1年A組")).not.toBeInTheDocument();
  });

  it("クラスを削除した後は一覧を再取得する", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const deleteClassRoom = vi.fn().mockResolvedValue(undefined);
    const getClassRoomList = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    });
    const api = createApi({ deleteClassRoom, getClassRoomList });

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={api}
          classRooms={[firstClassRoom]}
          teacherOptions={[]}
        />
      </MemoryRouter>
    );

    const table = screen.getByRole("table", { name: "クラス一覧" });
    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "クラスを削除する" }));

    await waitFor(() => expect(deleteClassRoom).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getClassRoomList).toHaveBeenCalled());
    expect(within(table).queryByText("1年A組")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("保存エラーはフォームを閉じたときに消去する", async () => {
    const user = userEvent.setup();
    const api = createApi({
      createClassRoom: vi.fn().mockRejectedValue(new Error("保存失敗")),
    });

    render(
      <MemoryRouter>
        <ClassRoomPage api={api} classRooms={[]} teacherOptions={[]} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "クラスコード*" }),
      "1A"
    );
    await user.type(
      screen.getByRole("textbox", { name: "クラス名*" }),
      "1年A組"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "クラスを保存できませんでした。"
    );

    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
