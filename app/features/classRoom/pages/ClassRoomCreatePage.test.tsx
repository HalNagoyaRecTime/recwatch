import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
  useRevalidator,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ClassRoomManagementApi } from "~/features/classRoom/api";
import { ClassRoomCreatePage } from "~/features/classRoom/pages/ClassRoomCreatePage";
import { ClassRoomEditPage } from "~/features/classRoom/pages/ClassRoomEditPage";
import { ApiClientError } from "~/lib/api-client-error";
import { UPDATE_CONFLICT_MESSAGE } from "~/lib/update-conflict";

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

function CreateRoute({ api }: { api: ClassRoomManagementApi }) {
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  async function returnToList(refresh: boolean) {
    await navigate(
      { pathname: "/classrooms", search: location.search },
      { replace: true }
    );
    if (refresh) await revalidator.revalidate();
  }

  return (
    <ClassRoomCreatePage
      api={api}
      onClose={() => returnToList(false)}
      onSaved={() => returnToList(true)}
      teacherOptions={[]}
    />
  );
}

function renderCreatePage(
  page: React.ReactElement,
  initialEntries = ["/classrooms/new?search=1A&page=2"]
) {
  const listLoader = vi.fn().mockResolvedValue(null);
  const router = createMemoryRouter(
    [
      {
        path: "/classrooms",
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
    const { listLoader } = renderCreatePage(<CreateRoute api={api} />);

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

  it("編集ページはIDと変更値を送信し、成功をRouteへ通知する", async () => {
    const user = userEvent.setup();
    const classRoom = {
      classRoomId: 12,
      classCode: "1A",
      className: "1年A組",
      studentCount: 3,
      teacher: null,
      lockVersion: 5,
    };
    const updateClassRoom = vi.fn().mockResolvedValue(classRoom);
    const onSaved = vi.fn().mockResolvedValue(undefined);

    render(
      <ClassRoomEditPage
        api={createApi({ updateClassRoom })}
        classRoom={classRoom}
        onConflict={vi.fn()}
        onClose={vi.fn()}
        onSaved={onSaved}
        teacherOptions={[]}
      />
    );

    await user.clear(
      await screen.findByRole("textbox", { name: "クラスコード*" })
    );
    await user.type(
      screen.getByRole("textbox", { name: "クラスコード*" }),
      "1B"
    );
    await user.clear(screen.getByRole("textbox", { name: "クラス名*" }));
    await user.type(
      screen.getByRole("textbox", { name: "クラス名*" }),
      "1年B組"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() =>
      expect(updateClassRoom).toHaveBeenCalledWith(12, {
        classCode: "1B",
        className: "1年B組",
        teacherId: null,
        lockVersion: 5,
      })
    );
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("更新が競合したら理由を伝えて再取得し、最新の値でフォームを置き換える", async () => {
    const user = userEvent.setup();
    const classRoom = {
      classRoomId: 12,
      classCode: "1A",
      className: "1年A組",
      studentCount: 3,
      teacher: null,
      lockVersion: 5,
    };
    const latest = { ...classRoom, className: "他の人の変更", lockVersion: 6 };
    const updateClassRoom = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(409, "conflict", "CLASS_ROOM_UPDATE_CONFLICT")
      )
      .mockResolvedValueOnce(latest);
    const onConflict = vi.fn();
    const onSaved = vi.fn().mockResolvedValue(undefined);
    const api = createApi({ updateClassRoom });
    const renderPage = (value: typeof classRoom) => (
      <ClassRoomEditPage
        api={api}
        classRoom={value}
        onConflict={onConflict}
        onClose={vi.fn()}
        onSaved={onSaved}
        teacherOptions={[]}
      />
    );
    const { rerender } = render(renderPage(classRoom));

    const nameInput = await screen.findByRole("textbox", {
      name: "クラス名*",
    });
    await user.clear(nameInput);
    await user.type(nameInput, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    expect(onConflict).toHaveBeenCalledOnce();
    expect(onSaved).not.toHaveBeenCalled();

    // 再取得の結果が新しい版で届いたら、編集中の内容は破棄される。
    rerender(renderPage(latest));
    expect(screen.getByRole("textbox", { name: "クラス名*" })).toHaveValue(
      "他の人の変更"
    );

    await user.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() =>
      expect(updateClassRoom).toHaveBeenLastCalledWith(12, {
        classCode: "1A",
        className: "他の人の変更",
        teacherId: null,
        lockVersion: 6,
      })
    );
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("登録APIエラー時はフォームを維持してエラーを表示する", async () => {
    const user = userEvent.setup();
    const api = createApi({
      createClassRoom: vi
        .fn()
        .mockRejectedValue(new Error("登録に失敗しました。")),
    });
    renderCreatePage(<CreateRoute api={api} />, ["/classrooms/new"]);

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
    const { router } = renderCreatePage(<CreateRoute api={createApi()} />, [
      "/classrooms?search=1A&page=2",
      "/classrooms/new?search=1A&page=2",
    ]);

    await user.click(await screen.findByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/classrooms")
    );

    await act(async () => {
      await router.navigate(-1);
    });

    expect(router.state.location.pathname).toBe("/classrooms");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
