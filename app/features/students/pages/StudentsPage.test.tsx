import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { StudentManagementApi } from "~/features/students/api";
import type { StudentRow } from "~/features/students/model/student";
import type { UserManagementApi } from "~/features/user-management/api";
import { StudentsPage } from "./StudentsPage";

const classRoom = {
  classRoomId: 1,
  classRoomCode: "1A",
  classRoomName: "1年Aクラス",
  studentCount: 0,
  teacherId: null,
  teacherName: null,
};

function makeStudent(
  id: number,
  name = `学生${id}`,
  overrides: Partial<StudentRow> = {}
): StudentRow {
  return {
    studentId: id,
    userId: id + 100,
    displayName: name,
    studentIdNumber: `S00${id}`,
    attendanceNumber: id,
    isLiveActive: true,
    isStaff: false,
    classRoom: {
      classRoomId: 1,
      classCode: "1A",
      className: "1年Aクラス",
    },
    ...overrides,
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function createApi(
  getStudents: ReturnType<typeof vi.fn>,
  overrides: Partial<StudentManagementApi> = {}
): StudentManagementApi {
  return {
    createStudent: vi.fn(),
    getStudents: getStudents as StudentManagementApi["getStudents"],
    updateStudent: vi.fn(),
    ...overrides,
  };
}

function renderPage(
  api: StudentManagementApi,
  initialEntry = "/students",
  userApi?: UserManagementApi
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <StudentsPage
        api={api}
        loadClassRooms={vi.fn().mockResolvedValue([classRoom])}
        userApi={userApi}
      />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("StudentsPage", () => {
  it("一覧未指定時はstaffがすべて・activeが有効で、検索をサーバーへ渡す", async () => {
    const getStudents = vi.fn().mockResolvedValue({
      items: [makeStudent(1, "山田太郎")],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    renderPage(createApi(getStudents));

    expect(
      await screen.findByRole("heading", { name: "学生管理" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "staffフィルター" })
    ).toHaveTextContent("staff:すべて");
    expect(
      screen.getByRole("combobox", { name: "有効状態フィルター" })
    ).toHaveTextContent("有効:はい");

    await user.type(
      screen.getByRole("searchbox", { name: "学生を検索" }),
      "山田"
    );

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "山田",
          classRoomId: undefined,
          isStaff: "all",
          isLiveActive: "true",
          limit: 50,
          offset: 0,
        })
      )
    );
    expect(screen.getByRole("table", { name: "学生一覧" })).toBeInTheDocument();
  });

  it("classRoom・staff・active filterをURLへ反映する", async () => {
    const getStudents = vi.fn().mockResolvedValue({
      items: [makeStudent(1)],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    renderPage(createApi(getStudents));

    await screen.findByRole("table", { name: "学生一覧" });
    await user.click(
      screen.getByRole("combobox", { name: "担当クラスフィルター" })
    );
    await user.click(screen.getByRole("option", { name: /1A 1年Aクラス/ }));
    await user.click(screen.getByRole("combobox", { name: "staffフィルター" }));
    await user.click(screen.getByRole("option", { name: "staff:はい" }));
    await user.click(
      screen.getByRole("combobox", { name: "有効状態フィルター" })
    );
    await user.click(screen.getByRole("option", { name: "有効:いいえ" }));

    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent(
        "classRoomId=1&isStaff=true&isLiveActive=false"
      )
    );
    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({
          classRoomId: 1,
          isStaff: "true",
          isLiveActive: "false",
          offset: 0,
        })
      )
    );
  });

  it("8種類のsortをURL経由でAPI契約へ渡し、staff・activeを表示する", async () => {
    const getStudents = vi.fn().mockResolvedValue({
      items: [
        makeStudent(1, "山田太郎", { isStaff: true, isLiveActive: false }),
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    renderPage(createApi(getStudents));

    const table = await screen.findByRole("table", { name: "学生一覧" });
    expect(within(table).getAllByText("staff").length).toBeGreaterThanOrEqual(
      2
    );
    expect(within(table).getByText("無効")).toBeInTheDocument();

    for (const [column, sortBy] of [
      ["ID", "studentId"],
      ["学籍番号", "studentIdNumber"],
      ["氏名", "displayName"],
      ["staff", "isStaff"],
      ["有効", "isLiveActive"],
      ["クラスコード", "classCode"],
      ["クラス名", "className"],
      ["出席番号", "attendanceNumber"],
    ] as const) {
      await user.click(screen.getByRole("button", { name: column }));
      await waitFor(() =>
        expect(getStudents).toHaveBeenLastCalledWith(
          expect.objectContaining({ sortBy, sortOrder: "asc", offset: 0 })
        )
      );
    }
  });

  it("操作メニューに編集・staff・有効状態変更を表示し、削除を表示しない", async () => {
    const student = makeStudent(1, "山田太郎", { isStaff: true });
    const getStudents = vi.fn().mockResolvedValue({
      items: [student],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const user = userEvent.setup();

    renderPage(createApi(getStudents));

    const table = await screen.findByRole("table", { name: "学生一覧" });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );

    expect(
      screen.getByRole("button", { name: "学生を編集する" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "staffを解除する" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "学生を無効化する" })
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "削除" })
    ).not.toBeInTheDocument();
  });

  it("active変更はstudent.userIdへPATCHし、現在条件の一覧を再取得する", async () => {
    const student = makeStudent(1, "山田太郎");
    const getStudents = vi.fn().mockResolvedValue({
      items: [student],
      total: 100,
      limit: 50,
      offset: 50,
    });
    const updateUserStatus = vi.fn().mockResolvedValue(undefined);
    const confirm = vi.fn().mockReturnValue(true);
    const user = userEvent.setup();
    vi.stubGlobal("confirm", confirm);

    renderPage(
      createApi(getStudents),
      "/students?search=%E5%B1%B1%E7%94%B0&isStaff=true&sortBy=isStaff&sortOrder=desc&page=2",
      {
        grantStaff: vi.fn(),
        revokeStaff: vi.fn(),
        updateUserStatus,
      }
    );

    const table = await screen.findByRole("table", { name: "学生一覧" });
    getStudents.mockClear();
    getStudents.mockResolvedValueOnce({
      items: [{ ...student, isLiveActive: false }],
      total: 100,
      limit: 50,
      offset: 50,
    });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );
    await user.click(screen.getByRole("button", { name: "学生を無効化する" }));

    await waitFor(() =>
      expect(updateUserStatus).toHaveBeenCalledWith(101, false)
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(1));
    expect(confirm).toHaveBeenCalledWith(
      "「山田太郎」を無効化します。よろしいですか？"
    );
    expect(getStudents).toHaveBeenLastCalledWith({
      classRoomId: undefined,
      isLiveActive: "true",
      isStaff: "true",
      limit: 50,
      offset: 50,
      search: "山田",
      sortBy: "isStaff",
      sortOrder: "desc",
    });
  });

  it("staff変更はstudent.userIdへPUTし、取消時はAPIを呼ばない", async () => {
    const student = makeStudent(1, "山田太郎");
    const getStudents = vi.fn().mockResolvedValue({
      items: [student],
      total: 1,
      limit: 50,
      offset: 0,
    });
    const grantStaff = vi.fn().mockResolvedValue(undefined);
    const confirm = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const user = userEvent.setup();
    vi.stubGlobal("confirm", confirm);

    renderPage(createApi(getStudents), "/students", {
      grantStaff,
      revokeStaff: vi.fn(),
      updateUserStatus: vi.fn(),
    });

    const table = await screen.findByRole("table", { name: "学生一覧" });
    getStudents.mockClear();
    getStudents.mockResolvedValueOnce({
      items: [{ ...student, isStaff: true }],
      total: 1,
      limit: 50,
      offset: 0,
    });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );
    await user.click(screen.getByRole("button", { name: "staffを付与する" }));
    expect(grantStaff).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "staffを付与する" }));
    await waitFor(() => expect(grantStaff).toHaveBeenCalledWith(101));
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(1));
  });

  it("作成成功後は現在条件で再取得し、レスポンスを一覧へ直接追加しない", async () => {
    const saved = makeStudent(10, "佐藤花子");
    const getStudents = vi
      .fn()
      .mockResolvedValueOnce({ items: [], total: 0, limit: 50, offset: 0 })
      .mockResolvedValueOnce({ items: [], total: 0, limit: 50, offset: 0 });
    const createStudent = vi.fn().mockResolvedValue(saved);
    const user = userEvent.setup();

    renderPage(createApi(getStudents, { createStudent }));

    await screen.findByRole("table", { name: "学生一覧" });
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByLabelText("氏名*"), "佐藤花子");
    await user.type(screen.getByLabelText("学籍番号*"), "S010");
    await user.type(screen.getByLabelText("出席番号*"), "5");
    await user.selectOptions(screen.getByLabelText("クラス*"), "1");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("佐藤花子")).not.toBeInTheDocument();
    expect(getStudents).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isStaff: "all",
        isLiveActive: "true",
        offset: 0,
      })
    );
  });

  it("更新成功後も現在の検索・filter・sort・ページ条件で再取得する", async () => {
    const student = makeStudent(1, "山田太郎");
    const getStudents = vi
      .fn()
      .mockResolvedValueOnce({
        items: [student],
        total: 1,
        limit: 50,
        offset: 0,
      })
      .mockResolvedValueOnce({ items: [], total: 0, limit: 50, offset: 0 });
    const updateStudent = vi.fn().mockResolvedValue(student);
    const user = userEvent.setup();

    renderPage(
      createApi(getStudents, { updateStudent }),
      "/students?search=%E5%B1%B1%E7%94%B0&isStaff=true&sortBy=isStaff&sortOrder=desc"
    );

    const table = await screen.findByRole("table", { name: "学生一覧" });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );
    await user.click(screen.getByRole("button", { name: "学生を編集する" }));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(updateStudent).toHaveBeenCalledWith(1, expect.anything())
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
    expect(getStudents).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: "山田",
        isStaff: "true",
        sortBy: "isStaff",
        sortOrder: "desc",
        offset: 0,
      })
    );
  });
});
