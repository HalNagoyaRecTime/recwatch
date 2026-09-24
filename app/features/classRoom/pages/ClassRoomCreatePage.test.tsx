import { act, render, screen, waitFor } from "@testing-library/react";
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
  initialEntries = ["/classroom/new?search=1A&page=2"]
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
    { initialEntries }
  );

  render(<RouterProvider router={router} />);
  return { listLoader, router };
}

describe("ClassRoomCreatePage", () => {
  it("登録成功後に一覧へ戻り、現在の検索条件を維持する", async () => {
    const user = userEvent.setup();
    const api = createApi({ createClassRoom: vi.fn().mockResolvedValue({}) });
    const onRevalidate = vi.fn().mockResolvedValue(undefined);
    const { listLoader } = renderCreatePage(
      <ClassRoomCreatePage
        api={api}
        onRevalidate={onRevalidate}
        teacherOptions={[]}
      />
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
    await waitFor(() => expect(onRevalidate).toHaveBeenCalledTimes(1));
    expect(listLoader).toHaveBeenCalledTimes(1);
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
    renderCreatePage(<ClassRoomCreatePage api={api} teacherOptions={[]} />, [
      "/classroom/new",
    ]);

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

  it("キャンセル後にブラウザで戻っても作成モーダルを再表示しない", async () => {
    const user = userEvent.setup();
    const { router } = renderCreatePage(
      <ClassRoomCreatePage api={createApi()} teacherOptions={[]} />,
      ["/classroom?search=1A&page=2", "/classroom/new?search=1A&page=2"]
    );

    await user.click(await screen.findByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/classroom")
    );

    await act(async () => {
      await router.navigate(-1);
    });

    expect(router.state.location.pathname).toBe("/classroom");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
