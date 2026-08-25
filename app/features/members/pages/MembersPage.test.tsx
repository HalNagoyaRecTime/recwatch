import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { MembersPage } from "./MembersPage";

describe("MembersPage", () => {
  it("uses the shared user-management UI without unsupported controls", async () => {
    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent: vi.fn(),
            deleteStudent: vi.fn(),
            getAllStudents: vi.fn().mockResolvedValue([]),
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue([])}
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "学生管理" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "ユーザー" })
    ).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "学生一覧" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /無効化/ })
    ).not.toBeInTheDocument();
  });

  it("registers a student individually and adds the API response to the table", async () => {
    const createStudent = vi.fn().mockResolvedValue({
      student_id: 10,
      display_name: "山田太郎",
      class_room_id: 1,
      class_room_name: "1年Aクラス",
      attendance_number: 5,
      student_id_number: "S010",
      is_live_active: true,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent,
            deleteStudent: vi.fn(),
            getAllStudents: vi.fn().mockResolvedValue([]),
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue([
            {
              classRoomId: 1,
              classRoomCode: "1A",
              classRoomName: "1年Aクラス",
              studentCount: 0,
              teacherId: null,
              teacherName: null,
            },
          ])}
        />
      </MemoryRouter>
    );

    await screen.findByRole("table", { name: "学生一覧" });
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByLabelText("氏名*"), "山田太郎");
    await user.type(screen.getByLabelText("学籍番号*"), "S010");
    await user.type(screen.getByLabelText("出席番号*"), "5");
    await user.selectOptions(screen.getByLabelText("クラス*"), "1");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(createStudent).toHaveBeenCalledWith({
        attendanceNumber: 5,
        classRoomId: 1,
        displayName: "山田太郎",
        studentIdNumber: "S010",
      })
    );
    expect(await screen.findByText("山田太郎")).toBeInTheDocument();
  });

  it("学生をソートし、3点メニューから削除する", async () => {
    const deleteStudent = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent: vi.fn(),
            deleteStudent,
            getAllStudents: vi.fn().mockResolvedValue([
              {
                student_id: 2,
                display_name: "山田太郎",
                class_room_id: 1,
                class_room_name: "1年Aクラス",
                attendance_number: 2,
                student_id_number: "S002",
                is_live_active: true,
              },
              {
                student_id: 1,
                display_name: "佐藤花子",
                class_room_id: 1,
                class_room_name: "1年Aクラス",
                attendance_number: 1,
                student_id_number: "S001",
                is_live_active: true,
              },
            ]),
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue([])}
        />
      </MemoryRouter>
    );

    const table = await screen.findByRole("table", { name: "学生一覧" });
    await user.click(screen.getByRole("button", { name: "学生ID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("佐藤花子");

    await user.click(screen.getByRole("button", { name: "学生ID" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("山田太郎");

    await user.click(screen.getByRole("button", { name: "山田太郎の操作" }));
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteStudent).toHaveBeenCalledWith(2));
    expect(screen.queryByText("山田太郎")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("削除した学生を同じ学籍番号で再登録して一覧へ戻す", async () => {
    const student = {
      student_id: 1,
      display_name: "佐藤花子",
      class_room_id: 1,
      class_room_name: "1年Aクラス",
      attendance_number: 1,
      student_id_number: "S001",
      is_live_active: true,
    };
    const deleteStudent = vi.fn().mockResolvedValue(undefined);
    const createStudent = vi.fn().mockResolvedValue(student);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent,
            deleteStudent,
            getAllStudents: vi.fn().mockResolvedValue([student]),
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue([
            {
              classRoomId: 1,
              classRoomCode: "1A",
              classRoomName: "1年Aクラス",
              studentCount: 1,
              teacherId: null,
              teacherName: null,
            },
          ])}
        />
      </MemoryRouter>
    );

    await screen.findByText("佐藤花子");
    await user.click(screen.getByRole("button", { name: "佐藤花子の操作" }));
    await user.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => expect(deleteStudent).toHaveBeenCalledWith(1));
    expect(screen.queryByText("佐藤花子")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByLabelText("氏名*"), "佐藤花子");
    await user.type(screen.getByLabelText("学籍番号*"), "S001");
    await user.type(screen.getByLabelText("出席番号*"), "1");
    await user.selectOptions(screen.getByLabelText("クラス*"), "1");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(createStudent).toHaveBeenCalledWith({
        attendanceNumber: 1,
        classRoomId: 1,
        displayName: "佐藤花子",
        studentIdNumber: "S001",
      })
    );
    expect(await screen.findByText("佐藤花子")).toBeInTheDocument();
    confirm.mockRestore();
  });
});
