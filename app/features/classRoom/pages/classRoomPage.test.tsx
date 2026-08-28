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

  it("既存クラスを編集して更新結果を一覧へ反映する", async () => {
    const updateClassRoom = vi.fn().mockResolvedValue({
      class_room_id: 1,
      class_code: "2A",
      class_name: "2年A組",
      student_count: 12,
      teacher: { teacher_id: 8, display_name: "鈴木教官" },
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={{
            createClassRoom: vi.fn(),
            deleteClassRoom: vi.fn(),
            updateClassRoom,
          }}
          classRooms={[
            {
              classRoomId: 1,
              classRoomCode: "1A",
              classRoomName: "1年A組",
              studentCount: 12,
              teacherId: null,
              teacherName: null,
            },
          ]}
          teacherOptions={[{ teacherId: 8, displayName: "鈴木教官" }]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "1年A組の操作" }));
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("textbox", { name: "クラス記号*" })).toHaveValue(
      "1A"
    );
    expect(screen.getByRole("textbox", { name: "クラス名*" })).toHaveValue(
      "1年A組"
    );

    await user.clear(screen.getByRole("textbox", { name: "クラス記号*" }));
    await user.type(screen.getByRole("textbox", { name: "クラス記号*" }), "2A");
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

  it("保存エラーはフォームを閉じたときに消去する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ClassRoomPage
          api={{
            createClassRoom: vi.fn().mockRejectedValue(new Error("保存失敗")),
            deleteClassRoom: vi.fn(),
            updateClassRoom: vi.fn(),
          }}
          classRooms={[]}
          teacherOptions={[]}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByRole("textbox", { name: "クラス記号*" }), "1A");
    await user.type(
      screen.getByRole("textbox", { name: "クラス名*" }),
      "1年A組"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("保存失敗");

    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
