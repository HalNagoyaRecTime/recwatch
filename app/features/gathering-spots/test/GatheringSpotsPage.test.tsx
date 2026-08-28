import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";
import { GatheringSpotsPage } from "~/features/gathering-spots/pages/GatheringSpotsPage";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createSpot(id: number, name: string): GatheringSpot {
  return {
    id,
    name,
    createdAt: "2026-08-07T09:00:00Z",
    updatedAt: "2026-08-07T09:10:00Z",
  };
}

function createGateway(
  overrides: Partial<GatheringSpotGateway> = {}
): GatheringSpotGateway {
  return {
    list: vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前")],
      total: 1,
      limit: 20,
      offset: 0,
    }),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("GatheringSpotsPage", () => {
  it("検索入力を一覧APIのnameクエリへ反映する", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list })} />);

    const search = await screen.findByRole("searchbox", {
      name: "集合場所を検索",
    });
    await user.type(search, "体育館");

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );
  });

  it("並び替え条件をAPI一覧取得へ渡す", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list })} />);

    await screen.findByText("体育館前");
    await user.click(screen.getByRole("button", { name: "集合場所名" }));

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: undefined,
        offset: 0,
        sort: { columnId: "name", direction: "asc" },
      })
    );
  });

  it("作成後に現在の検索条件で一覧を再取得する", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const create = vi.fn().mockResolvedValue(createSpot(2, "正門前"));
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ create, list })} />);

    const search = await screen.findByRole("searchbox", {
      name: "集合場所を検索",
    });
    await user.type(search, "体育館");
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );

    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "集合場所名*" }),
      "正門前"
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith("正門前"));
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );
    expect(screen.queryByText("正門前")).not.toBeInTheDocument();
  });

  it("更新後に現在の検索条件で一覧を再取得する", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const update = vi.fn().mockResolvedValue(createSpot(1, "正門前"));
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list, update })} />);

    const search = await screen.findByRole("searchbox", {
      name: "集合場所を検索",
    });
    await user.type(search, "体育館");
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );

    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    const input = screen.getByRole("textbox", { name: "集合場所名*" });
    await user.clear(input);
    await user.type(input, "正門前");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(update).toHaveBeenCalledWith(1, "正門前"));
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );
  });

  it("削除後に現在ページを再取得して次ページの項目を繰り上げる", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) =>
      createSpot(index + 1, `スポット${index + 1}`)
    );
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: firstPage,
        total: 21,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: firstPage.slice(1).concat(createSpot(21, "スポット21")),
        total: 20,
        limit: 20,
        offset: 0,
      });
    const deleteSpot = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <GatheringSpotsPage
        gateway={createGateway({ delete: deleteSpot, list })}
      />
    );

    await screen.findByText("スポット1");
    await user.click(
      screen.getByRole("button", { name: "スポット1のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteSpot).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(screen.getByText("スポット21")).toBeInTheDocument()
    );
    expect(screen.queryByText("スポット1")).not.toBeInTheDocument();
    expect(list).toHaveBeenLastCalledWith({
      limit: 20,
      name: undefined,
      offset: 0,
    });
  });

  it("最終ページの最後の1件を削除すると前ページへ戻る", async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) =>
      createSpot(index + 1, `スポット${index + 1}`)
    );
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: firstPage,
        total: 21,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [createSpot(21, "スポット21")],
        total: 21,
        limit: 20,
        offset: 20,
      })
      .mockResolvedValueOnce({
        items: [],
        total: 20,
        limit: 20,
        offset: 20,
      })
      .mockResolvedValueOnce({
        items: firstPage,
        total: 20,
        limit: 20,
        offset: 0,
      });
    const deleteSpot = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <GatheringSpotsPage
        gateway={createGateway({ delete: deleteSpot, list })}
      />
    );

    await screen.findByText("スポット1");
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByText("スポット21");
    await user.click(
      screen.getByRole("button", { name: "スポット21のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteSpot).toHaveBeenCalledWith(21));
    await waitFor(() =>
      expect(screen.getByText("スポット1")).toBeInTheDocument()
    );
    expect(screen.queryByText("スポット21")).not.toBeInTheDocument();
    expect(list).toHaveBeenLastCalledWith({
      limit: 20,
      name: undefined,
      offset: 0,
    });
  });

  it("削除中は他の削除操作を無効にする", async () => {
    let resolveDelete: (() => void) | undefined;
    const deleteSpot = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <GatheringSpotsPage
        gateway={createGateway({
          delete: deleteSpot,
          list: vi.fn().mockResolvedValue({
            items: [createSpot(1, "スポット1"), createSpot(2, "スポット2")],
            total: 2,
            limit: 20,
            offset: 0,
          }),
        })}
      />
    );

    await screen.findByText("スポット1");
    await user.click(
      screen.getByRole("button", { name: "スポット1のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    await waitFor(() => expect(deleteSpot).toHaveBeenCalledWith(1));

    expect(
      screen.getByRole("button", { name: "スポット1のその他の操作" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "スポット2のその他の操作" })
    ).toBeDisabled();

    resolveDelete?.();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "スポット1のその他の操作" })
      ).not.toBeDisabled()
    );
  });
});
