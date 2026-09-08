import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ClassRoomManagementApi } from "~/features/classRoom/api";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";

afterEach(() => {
  vi.restoreAllMocks();
});

function createApi(
  overrides: Partial<ClassRoomManagementApi> = {}
): ClassRoomManagementApi {
  return {
    createClassRoom: vi.fn(),
    deleteClassRoom: vi.fn(),
    getClassRoomById: vi.fn(),
    getClassRoomList: vi.fn(),
    updateClassRoom: vi.fn(),
    ...overrides,
  };
}

function ClassRoomListRoute() {
  const location = useLocation();
  return (
    <>
      <p>クラス一覧</p>
      <output data-testid="location-search">{location.search}</output>
      <Outlet />
    </>
  );
}

function renderCreatePage(
  page: React.ReactElement,
  initialEntry = "/classroom/new?search=1A&page=2"
) {
  const listLoader = vi.fn().mockResolvedValue(null);
  const router = createMemoryRouter(
    [
      {
        path: "/classroom",
        element: <ClassRoomListRoute />,
        loader: listLoader,
        children: [{ path: "new", element: page }],
      },
    ],
    { initialEntries: [initialEntry] }
  );

  render(<RouterProvider router={router} />);
  return listLoader;
}

describe("ClassRoomCreatePage", () => {
  it("登録成功後に一覧へ戻り、現在の検索条件を維持する", async () => {
    const user = userEvent.setup();
    const api = createApi({ createClassRoom: vi.fn().mockResolvedValue({}) });
    const listLoader = renderCreatePage(
      <ClassRoomCreatePage api={api} teacherOptions={[]} />
    );

    await user.type(
      await screen.findByRole("textbox", { name: "クラスコード*" }),
      "1B"
    );
    await user.type(
      await screen.findByRole("textbox", { name: "クラス名*" }),
      "1年B組"
    );
    await user.click(await screen.findByRole("button", { name: "保存する" }));

    expect(await screen.findByText("クラス一覧")).toBeInTheDocument();
    await waitFor(() => expect(listLoader).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "search=1A&page=2"
    );
    expect(api.createClassRoom).toHaveBeenCalledWith({
      classCode: "1B",
      className: "1年B組",
      teacherId: null,
    });
  });

  it("登録APIエラー時はフォームを維持してエラーを表示する", async () => {
    const user = userEvent.setup();
    const api = createApi({
      createClassRoom: vi
        .fn()
        .mockRejectedValue(new Error("登録に失敗しました。")),
    });
    renderCreatePage(
      <ClassRoomCreatePage api={api} teacherOptions={[]} />,
      "/classroom/new"
    );

    await user.type(
      await screen.findByRole("textbox", { name: "クラスコード*" }),
      "1A"
    );
    await user.type(
      await screen.findByRole("textbox", { name: "クラス名*" }),
      "1年A組"
    );
    await user.click(await screen.findByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "登録に失敗しました。"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
