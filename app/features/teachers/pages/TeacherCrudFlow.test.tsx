import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  MemoryRouter,
  Outlet,
  RouterProvider,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import { TeacherActionMenu } from "~/features/teachers/components/TeacherActionMenu";
import { TeacherCreatePage } from "~/features/teachers/pages/TeacherCreatePage";
import { TeacherEditPage } from "~/features/teachers/pages/TeacherEditPage";
import type { TeacherRow } from "~/features/teachers/model/teacher";

const mocks = vi.hoisted(() => ({
  createTeacher: vi.fn(),
  updateTeacher: vi.fn(),
}));

vi.mock("~/features/teachers/api", () => ({ TeacherApi: mocks }));

vi.mock("~/features/teachers/components/TeacherFormModal", () => ({
  TeacherFormModal: ({
    children,
    onClose,
    title,
  }: {
    children: React.ReactNode | ((requestClose: () => void) => React.ReactNode);
    onClose: () => void;
    title: React.ReactNode;
  }) => (
    <div role="dialog">
      <h2>{title}</h2>
      {typeof children === "function" ? children(onClose) : children}
    </div>
  ),
}));

const classRooms = [
  { classRoomId: 2, className: "2年A組" },
  { classRoomId: 4, className: "4年A組" },
];

const teacher: TeacherRow = {
  teacherId: 7,
  displayName: "佐橋 晴斗",
  isLiveActive: true,
  isStaff: false,
  classRooms: [{ classRoomId: 2, classCode: "2A", className: "2年A組" }],
};

function TeacherListDestination() {
  return <p>教官一覧</p>;
}

function TeacherListRoute() {
  return (
    <>
      <TeacherListDestination />
      <Outlet />
    </>
  );
}

function renderNestedCreateRouter(element: React.ReactElement) {
  const listLoader = vi.fn().mockResolvedValue(null);
  const router = createMemoryRouter(
    [
      {
        path: "/teachers",
        loader: listLoader,
        element: <TeacherListRoute />,
        children: [{ path: "new", element }],
      },
    ],
    { initialEntries: ["/teachers/new?search=佐橋&page=2"] }
  );

  render(<RouterProvider router={router} />);
  return listLoader;
}

function renderCrudRouter(initialEntry: string, element: React.ReactElement) {
  const listLoader = vi.fn().mockResolvedValue(null);
  const router = createMemoryRouter(
    [
      { path: "/teachers/new", element },
      { path: "/teachers/:teacherId/edit", element },
      {
        path: "/teachers",
        loader: listLoader,
        element: <TeacherListDestination />,
      },
    ],
    { initialEntries: [initialEntry] }
  );

  render(<RouterProvider router={router} />);
  return listLoader;
}

describe("teacher create and edit flows", () => {
  it("作成成功時にAPIを呼び、モーダルを閉じて一覧へ戻る", async () => {
    mocks.createTeacher.mockResolvedValueOnce({});
    const user = userEvent.setup();

    const listLoader = renderNestedCreateRouter(
      <TeacherCreatePage classRooms={classRooms} />
    );

    await user.type(await screen.findByLabelText("先生名"), "新任");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByText("教官一覧")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(listLoader).toHaveBeenCalledTimes(2));
    expect(mocks.createTeacher).toHaveBeenCalledWith({
      classRoomIds: [],
      userName: "新任",
    });
  });

  it("作成APIエラーをフォームへ表示してモーダルを維持する", async () => {
    mocks.createTeacher.mockRejectedValueOnce(
      new Error("登録に失敗しました。")
    );
    const user = userEvent.setup();

    renderCrudRouter("/teachers/new", <TeacherCreatePage classRooms={[]} />);

    await user.type(screen.getByLabelText("先生名"), "新任");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "登録に失敗しました。"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("更新成功時にteacherIdと担当クラスを送信して一覧へ戻る", async () => {
    mocks.updateTeacher.mockResolvedValueOnce({});
    const user = userEvent.setup();

    const listLoader = renderCrudRouter(
      "/teachers/7/edit?sortBy=teacherId",
      <TeacherEditPage classRooms={classRooms} teacher={teacher} />
    );

    await user.click(screen.getByRole("checkbox", { name: "4年A組" }));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByText("教官一覧")).toBeInTheDocument();
    expect(listLoader).toHaveBeenCalledTimes(1);
    expect(mocks.updateTeacher).toHaveBeenCalledWith(7, {
      classRoomIds: [2, 4],
      userName: "佐橋 晴斗",
    });
  });

  it("更新APIエラーをフォームへ表示してモーダルを維持する", async () => {
    mocks.updateTeacher.mockRejectedValueOnce(
      new Error("更新に失敗しました。")
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/teachers/7/edit"]}>
        <TeacherEditPage classRooms={classRooms} teacher={teacher} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "更新に失敗しました。"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

function renderActionRouter(onDelete = vi.fn()) {
  const router = createMemoryRouter(
    [
      {
        path: "/teachers",
        element: <TeacherActionMenu onDelete={onDelete} teacher={teacher} />,
      },
      { path: "/teachers/7/edit", element: <p>編集ページ</p> },
    ],
    { initialEntries: ["/teachers"] }
  );

  render(<RouterProvider router={router} />);
}

describe("TeacherActionMenu", () => {
  it("編集と削除を3点メニューから選べる", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    renderActionRouter(onDelete);
    await user.click(
      await screen.findByRole("button", { name: "佐橋 晴斗の操作" })
    );

    const editButton = screen.getByRole("button", { name: "編集" });
    expect(editButton.querySelector("svg")).toBeNull();
    const deleteButton = screen.getByRole("button", { name: "削除" });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(teacher);

    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(await screen.findByText("編集ページ")).toBeInTheDocument();
  });
});
