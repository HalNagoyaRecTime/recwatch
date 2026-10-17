import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { ClassRoom } from "~/features/classRoom/model/classRoom";
import type { StudentManagementApi } from "~/features/students/api";
import type { StudentRow } from "~/features/students/model/student";
import type { UserManagementApi } from "~/features/user-management/api";
import { StudentsPage } from "./StudentsPage";

const classRoom = {
  classRoomId: 1,
  classCode: "1A",
  className: "1年Aクラス",
  studentCount: 0,
  teacher: null,
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
  return (
    <>
      <output data-testid="location-pathname">{location.pathname}</output>
      <output data-testid="location-search">{location.search}</output>
    </>
  );
}

function HistoryBackButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} type="button">
      ブラウザーの戻る
    </button>
  );
}

function createApi(
  getStudents: ReturnType<typeof vi.fn>,
  overrides: Partial<StudentManagementApi> = {}
): StudentManagementApi {
  return {
    createStudent: vi.fn(),
    getStudents: getStudents as StudentManagementApi["getStudents"],
    getStudentById: vi.fn(),
    updateStudent: vi.fn(),
    ...overrides,
  };
}

function renderPage(
  api: StudentManagementApi,
  initialEntry = "/students",
  userApi?: UserManagementApi,
  data: {
    classRooms?: ClassRoom[];
    offset?: number;
    onRevalidate?: () => Promise<void> | void;
    students?: StudentRow[];
    total?: number;
  } = {}
) {
  const queryString = initialEntry.split("?")[1] ?? "";
  const page = Number(new URLSearchParams(queryString).get("page")) || 1;
  const students = data.students ?? [];

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <StudentsPage
        api={api}
        classRooms={data.classRooms ?? [classRoom]}
        limit={50}
        offset={data.offset ?? (page - 1) * 50}
        onRevalidate={data.onRevalidate ?? vi.fn().mockResolvedValue(undefined)}
        students={students}
        total={data.total ?? students.length}
        userApi={
          userApi ?? {
            grantStaff: vi.fn(),
            revokeStaff: vi.fn(),
            updateUserStatus: vi.fn(),
          }
        }
      />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("StudentsPage", () => {
  it("loaderから新しい学生一覧が渡されると表示を更新する", async () => {
    const api = createApi(vi.fn());
    const userApi: UserManagementApi = {
      grantStaff: vi.fn(),
      revokeStaff: vi.fn(),
      updateUserStatus: vi.fn(),
    };
    const { rerender } = render(
      <MemoryRouter initialEntries={["/students"]}>
        <StudentsPage
          api={api}
          classRooms={[classRoom]}
          limit={50}
          offset={0}
          onRevalidate={vi.fn()}
          students={[makeStudent(1, "初回データ")]}
          total={1}
          userApi={userApi}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("初回データ")).toBeInTheDocument();

    rerender(
      <MemoryRouter initialEntries={["/students"]}>
        <StudentsPage
          api={api}
          classRooms={[classRoom]}
          limit={50}
          offset={0}
          onRevalidate={vi.fn()}
          students={[makeStudent(2, "再検証後データ")]}
          total={1}
          userApi={userApi}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("再検証後データ")).toBeInTheDocument();
    expect(screen.queryByText("初回データ")).not.toBeInTheDocument();
  });

  it("URLの検索を初期表示し、ブラウザーの戻る操作で検索欄を戻す", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/students?search=%E5%88%9D%E6%9C%9F"]}>
        <StudentsPage
          api={createApi(vi.fn())}
          classRooms={[classRoom]}
          limit={50}
          offset={0}
          onRevalidate={vi.fn()}
          students={[]}
          total={0}
          userApi={{
            grantStaff: vi.fn(),
            revokeStaff: vi.fn(),
            updateUserStatus: vi.fn(),
          }}
        />
        <LocationProbe />
        <HistoryBackButton />
      </MemoryRouter>
    );

    const search = screen.getByRole("searchbox", { name: "学生を検索" });
    expect(search).toHaveValue("初期");
    await user.clear(search);
    await user.type(search, "新しい検索");
    await waitFor(() =>
      expect(
        new URLSearchParams(
          screen.getByTestId("location-search").textContent ?? ""
        ).get("search")
      ).toBe("新しい検索")
    );

    await user.click(screen.getByRole("button", { name: "ブラウザーの戻る" }));
    await waitFor(() => expect(search).toHaveValue("初期"));
  });

  it("一覧URLの既定filterを表示し、検索条件をURLへ反映する", async () => {
    const getStudents = vi.fn();
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
      expect(
        new URLSearchParams(
          screen.getByTestId("location-search").textContent ?? ""
        ).get("search")
      ).toBe("山田")
    );
    expect(getStudents).not.toHaveBeenCalled();
    expect(screen.getByRole("table", { name: "学生一覧" })).toBeInTheDocument();
  });

  it("classRoom・staff・active filterをURLへ反映する", async () => {
    const getStudents = vi.fn();
    const user = userEvent.setup();

    renderPage(createApi(getStudents), "/students", undefined, {
      students: [makeStudent(1)],
      total: 1,
    });

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
    expect(getStudents).not.toHaveBeenCalled();
  });

  it("8種類のsortをURLへ反映し、staff・activeを表示する", async () => {
    const getStudents = vi.fn();
    const user = userEvent.setup();

    renderPage(createApi(getStudents), "/students", undefined, {
      students: [
        makeStudent(1, "山田太郎", { isStaff: true, isLiveActive: false }),
      ],
      total: 1,
    });

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
        expect(
          new URLSearchParams(
            screen.getByTestId("location-search").textContent ?? ""
          ).get("sortBy")
        ).toBe(sortBy)
      );
      expect(
        new URLSearchParams(
          screen.getByTestId("location-search").textContent ?? ""
        ).get("sortOrder")
      ).toBe("asc");
    }
    expect(getStudents).not.toHaveBeenCalled();
  });

  it("操作メニューに編集・staff・有効状態変更を表示し、削除を表示しない", async () => {
    const student = makeStudent(1, "山田太郎", { isStaff: true });
    const user = userEvent.setup();

    renderPage(createApi(vi.fn()), "/students", undefined, {
      students: [student],
      total: 1,
    });

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

  it("active変更はstudent.userIdへPATCHし、Route loaderを再検証する", async () => {
    const student = makeStudent(1, "山田太郎");
    const getStudents = vi.fn();
    const updateUserStatus = vi.fn().mockResolvedValue(undefined);
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
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
      },
      {
        students: [student],
        total: 100,
        offset: 50,
        onRevalidate,
      }
    );

    const table = await screen.findByRole("table", { name: "学生一覧" });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );
    await user.click(screen.getByRole("button", { name: "学生を無効化する" }));

    await waitFor(() =>
      expect(updateUserStatus).toHaveBeenCalledWith(101, false)
    );
    await waitFor(() => expect(onRevalidate).toHaveBeenCalledOnce());
    expect(getStudents).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledWith(
      "「山田太郎」を無効化します。よろしいですか？"
    );
  });

  it("staff変更はstudent.userIdへPUTし、Route loaderを再検証する", async () => {
    const student = makeStudent(1, "山田太郎");
    const getStudents = vi.fn();
    const grantStaff = vi.fn().mockResolvedValue(undefined);
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const confirm = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const user = userEvent.setup();
    vi.stubGlobal("confirm", confirm);

    renderPage(
      createApi(getStudents),
      "/students",
      {
        grantStaff,
        revokeStaff: vi.fn(),
        updateUserStatus: vi.fn(),
      },
      {
        students: [student],
        total: 1,
        onRevalidate,
      }
    );

    const table = await screen.findByRole("table", { name: "学生一覧" });
    await user.click(
      within(table).getByRole("button", { name: "山田太郎の操作" })
    );
    await user.click(screen.getByRole("button", { name: "staffを付与する" }));
    expect(grantStaff).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "staffを付与する" }));
    await waitFor(() => expect(grantStaff).toHaveBeenCalledWith(101));
    await waitFor(() => expect(onRevalidate).toHaveBeenCalledOnce());
    expect(getStudents).not.toHaveBeenCalled();
  });

  it("新規登録と編集を検索条件つきのnested Routeへ遷移する", async () => {
    const user = userEvent.setup();
    const student = makeStudent(1, "山田太郎");
    renderPage(
      createApi(vi.fn()),
      "/students?search=%E5%B1%B1%E7%94%B0&isStaff=true&page=2",
      undefined,
      { students: [student], total: 100, offset: 50 }
    );

    await screen.findByRole("table", { name: "学生一覧" });
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-pathname")).toHaveTextContent(
        "/students/new"
      )
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=%E5%B1%B1%E7%94%B0&isStaff=true&page=2"
    );

    await user.click(
      within(screen.getByRole("table", { name: "学生一覧" })).getByRole(
        "button",
        { name: "山田太郎の操作" }
      )
    );
    await user.click(screen.getByRole("button", { name: "学生を編集する" }));
    await waitFor(() =>
      expect(screen.getByTestId("location-pathname")).toHaveTextContent(
        "/students/1/edit"
      )
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=%E5%B1%B1%E7%94%B0&isStaff=true&page=2"
    );
  });
});
