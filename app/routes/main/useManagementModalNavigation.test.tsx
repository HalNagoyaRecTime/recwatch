import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
  type LoaderFunction,
} from "react-router";
import { describe, expect, it, vi } from "vitest";

import {
  useManagementModalNavigation,
  useManagementModalReturn,
} from "~/routes/main/useManagementModalNavigation";

function ListRoute() {
  const closeModal = useManagementModalNavigation("/students");
  const location = useLocation();
  return (
    <>
      <p>学生一覧</p>
      <output data-testid="location-search">{location.search}</output>
      <Outlet context={{ closeModal, options: readyOptions() }} />
    </>
  );
}

function ModalRoute() {
  const closeModal = useManagementModalReturn();
  return (
    <div role="dialog">
      <button onClick={() => void closeModal()} type="button">
        キャンセル
      </button>
      <button onClick={() => void closeModal(true)} type="button">
        保存
      </button>
    </div>
  );
}

function readyOptions() {
  return { error: null, isLoading: false, items: [] };
}

function renderRouter(loader: LoaderFunction) {
  const router = createMemoryRouter(
    [
      {
        path: "/students",
        loader,
        element: <ListRoute />,
        children: [{ path: "new", element: <ModalRoute /> }],
      },
    ],
    {
      initialEntries: [
        "/students?search=山田&page=3",
        "/students/new?search=山田&page=3",
      ],
      initialIndex: 1,
    }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("useManagementModalNavigation", () => {
  it("cancelはqueryを保ち、replaceで戻り、revalidateしない", async () => {
    const user = userEvent.setup();
    const loader = vi.fn().mockResolvedValue(null);
    const router = renderRouter(loader as unknown as LoaderFunction);

    await user.click(await screen.findByRole("button", { name: "キャンセル" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    expect(router.state.location.search).toBe("?search=山田&page=3");
    expect(loader).toHaveBeenCalledOnce();

    await router.navigate(-1);
    expect(router.state.location.pathname).toBe("/students");
  });

  it("save成功はqueryを保ち、一覧revalidateを1回だけ行う", async () => {
    const user = userEvent.setup();
    const loader = vi.fn().mockResolvedValue(null);
    const router = renderRouter(loader as unknown as LoaderFunction);

    await user.click(await screen.findByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/students")
    );
    expect(router.state.location.search).toBe("?search=山田&page=3");
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });
});
