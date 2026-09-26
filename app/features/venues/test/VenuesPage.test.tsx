import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import type { VenueGateway } from "~/features/venues/api/contracts/venue-gateway";
import type { Venue } from "~/features/venues/model/venue";
import { VenuesPage } from "~/features/venues/pages/VenuesPage";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createVenue(id: number, name: string): Venue {
  return {
    id,
    name,
    createdAt: "2026-09-25T09:00:00Z",
    updatedAt: "2026-09-25T09:10:00Z",
  };
}

function createGateway(overrides: Partial<VenueGateway> = {}): VenueGateway {
  return {
    list: vi.fn().mockResolvedValue({
      items: [createVenue(1, "体育館")],
      total: 1,
      limit: 20,
      offset: 0,
    }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("VenuesPage", () => {
  it("検索入力を一覧APIのnameクエリへ反映する", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createVenue(1, "体育館")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ list })} />);

    const search = await screen.findByRole("searchbox", {
      name: "実施場所を検索",
    });
    await user.type(search, "体育");

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育",
        offset: 0,
      })
    );
  });

  it("並び替え条件をAPI一覧取得へ渡す", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createVenue(1, "体育館")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ list })} />);

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "実施場所名" }));

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: undefined,
        offset: 0,
        sort: { columnId: "name", direction: "asc" },
      })
    );
  });

  it("登録後に一覧を再取得してフォームを閉じる", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createVenue(1, "体育館")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const create = vi.fn().mockResolvedValue(createVenue(2, "グラウンド"));
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ create, list })} />);

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "実施場所名*" }),
      "  グラウンド  "
    );
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith("グラウンド"));
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("textbox", { name: "実施場所名*" })
    ).not.toBeInTheDocument();
  });

  it("空の名前では登録せずに入力を促す", async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ create })} />);

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(screen.getByRole("textbox", { name: "実施場所名*" }), "  ");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText("実施場所名を入力してください。")
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("編集した名前で更新する", async () => {
    const update = vi.fn().mockResolvedValue(createVenue(1, "第1体育館"));
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ update })} />);

    await screen.findByText("体育館");
    await user.click(
      screen.getByRole("button", { name: "体育館のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    const input = screen.getByRole("textbox", { name: "実施場所名*" });
    await user.clear(input);
    await user.type(input, "第1体育館");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(update).toHaveBeenCalledWith(1, "第1体育館"));
  });

  it("削除後に一覧を再取得する", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: [createVenue(1, "体育館"), createVenue(2, "グラウンド")],
        total: 2,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValueOnce({
        items: [createVenue(2, "グラウンド")],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const deleteVenue = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <VenuesPage gateway={createGateway({ delete: deleteVenue, list })} />
    );

    await screen.findByText("体育館");
    await user.click(
      screen.getByRole("button", { name: "体育館のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => expect(deleteVenue).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(screen.queryByText("体育館")).not.toBeInTheDocument()
    );
    expect(screen.getByText("グラウンド")).toBeInTheDocument();
  });

  it("競技で使われている実施場所は削除できないことを伝える", async () => {
    const deleteVenue = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(
          409,
          "競技から参照されている実施場所は削除できません",
          "VENUE_IN_USE"
        )
      );
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<VenuesPage gateway={createGateway({ delete: deleteVenue })} />);

    await screen.findByText("体育館");
    await user.click(
      screen.getByRole("button", { name: "体育館のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "競技から参照されている実施場所は削除できません"
    );
    expect(screen.getByText("体育館")).toBeInTheDocument();
  });
});
