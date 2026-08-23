import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

import { ClassRoomPage } from "./classRoomPage";

afterEach(cleanup);

describe("ClassRoomPage", () => {
  it("教官管理と共通の一覧UIとユーザー管理ナビゲーションを表示する", () => {
    render(
      <MemoryRouter>
        <ClassRoomPage classRooms={[]} teacherOptions={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("table", { name: "クラス一覧" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "ユーザー" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "教官管理" })).toHaveAttribute(
      "href",
      "/teachers"
    );
  });

  it("個別にクラスを登録して一覧へ反映する", async () => {
    const createClassRoom = vi.fn().mockResolvedValue({
      class_room_id: 2,
      class_code: "1B",
      class_name: "1年B組",
      student_count: 0,
      teacher: null,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={{
            createClassRoom,
            updateClassRoom: vi.fn(),
            deleteClassRoom: vi.fn(),
          }}
          classRooms={[]}
          teacherOptions={[]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByRole("textbox", { name: "クラス記号*" }), "1B");
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
    expect(await screen.findByText("1B")).toBeInTheDocument();
  });

  it("クラスをソートし、3点メニューから削除する", async () => {
    const deleteClassRoom = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={{
            createClassRoom: vi.fn(),
            deleteClassRoom,
            updateClassRoom: vi.fn(),
          }}
          classRooms={[
            {
              classRoomId: 2,
              classRoomCode: "B",
              classRoomName: "Bクラス",
              studentCount: 2,
              teacherId: null,
              teacherName: null,
            },
            {
              classRoomId: 1,
              classRoomCode: "A",
              classRoomName: "Aクラス",
              studentCount: 1,
              teacherId: null,
              teacherName: null,
            },
          ]}
          teacherOptions={[]}
        />
      </MemoryRouter>
    );

    const table = screen.getByRole("table", { name: "クラス一覧" });
    await user.click(screen.getByRole("button", { name: "クラスID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Aクラス");

    await user.click(screen.getByRole("button", { name: "クラスID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Bクラス");

    await user.click(screen.getByRole("button", { name: "Bクラスの操作" }));
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteClassRoom).toHaveBeenCalledWith(2));
    expect(screen.queryByText("Bクラス")).not.toBeInTheDocument();
    confirm.mockRestore();
  });
});
