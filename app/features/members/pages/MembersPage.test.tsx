import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { StudentDTO } from "~/features/members/api";
import { MembersPage } from "./MembersPage";

function makeStudent(id: number, name = `学生${id}`): StudentDTO {
  return {
    student_id: id,
    user_id: id + 100,
    display_name: name,
    student_id_number: `S00${id}`,
    attendance_number: id,
    is_live_active: true,
    is_staff: false,
    class_room: {
      class_room_id: 1,
      class_code: "1A",
      class_name: "1年Aクラス",
    },
  };
}

function classRooms() {
  return [
    {
      classRoomId: 1,
      classRoomCode: "1A",
      classRoomName: "1年Aクラス",
      studentCount: 0,
      teacherId: null,
      teacherName: null,
    },
  ];
}

describe("MembersPage", () => {
  it("新しい学生一覧契約で検索条件をサーバーへ渡す", async () => {
    const getStudents = vi.fn().mockResolvedValue({
      items: [makeStudent(1, "山田太郎")],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent: vi.fn(),
            deleteStudent: vi.fn(),
            getStudents,
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue(classRooms())}
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: "学生管理" })
    ).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "学生を検索" }),
      "山田"
    );

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "山田", limit: 50, offset: 0 })
      )
    );
    expect(screen.getByRole("table", { name: "学生一覧" })).toBeInTheDocument();
  });

  it("学生を登録し、APIレスポンスを一覧へ追加する", async () => {
    const saved = makeStudent(10, "山田太郎");
    const createStudent = vi.fn().mockResolvedValue(saved);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent,
            deleteStudent: vi.fn(),
            getStudents: vi.fn().mockResolvedValue({
              items: [],
              total: 0,
              limit: 50,
              offset: 0,
            }),
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue(classRooms())}
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

  it("一覧のソート操作をURL経由でサーバー契約へ渡す", async () => {
    const getStudents = vi.fn().mockResolvedValue({
      items: [makeStudent(1)],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MembersPage
          api={{
            createStudent: vi.fn(),
            deleteStudent: vi.fn(),
            getStudents,
            updateStudent: vi.fn(),
          }}
          loadClassRooms={vi.fn().mockResolvedValue([])}
        />
      </MemoryRouter>
    );

    await screen.findByRole("table", { name: "学生一覧" });
    await user.click(screen.getByRole("button", { name: "学籍番号" }));

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "studentIdNumber", sortOrder: "asc" })
      )
    );
  });
});
