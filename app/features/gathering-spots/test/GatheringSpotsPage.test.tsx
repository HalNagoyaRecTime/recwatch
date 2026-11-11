import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";
import { GatheringSpotsPage } from "~/features/gathering-spots/pages/GatheringSpotsPage";
import { ApiClientError } from "~/lib/api-client-error";
import {
  UPDATE_CONFLICT_MESSAGE,
  UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE,
} from "~/lib/update-conflict";
import { resizeImage } from "~/lib/resize-image";

vi.mock("~/lib/resize-image", () => ({ resizeImage: vi.fn() }));

const resizedImage = new Blob(["resized"], { type: "image/jpeg" });

beforeEach(() => {
  vi.mocked(resizeImage).mockResolvedValue(resizedImage);
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createSpot(
  id: number,
  name: string,
  imageUrl: string | null = null
): GatheringSpot {
  return {
    id,
    name,
    imageUrl,
    createdAt: "2026-08-07T09:00:00Z",
    updatedAt: "2026-08-07T09:10:00Z",
    lockVersion: 0,
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
    setImage: vi.fn().mockResolvedValue(undefined),
    deleteImage: vi.fn().mockResolvedValue(undefined),
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

    await waitFor(() => expect(update).toHaveBeenCalledWith(1, "正門前", 0));
    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith({
        limit: 20,
        name: "体育館",
        offset: 0,
      })
    );
  });

  it("更新が競合したら理由を伝えて再取得し、最新の値でフォームを置き換える", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: [createSpot(1, "体育館前")],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValue({
        items: [{ ...createSpot(1, "他の人の変更"), lockVersion: 1 }],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const update = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(409, "conflict", "GATHERING_SPOT_UPDATE_CONFLICT")
      )
      .mockResolvedValue(createSpot(1, "他の人の変更"));
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list, update })} />);

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    const input = screen.getByRole("textbox", { name: "集合場所名*" });
    await user.clear(input);
    await user.type(input, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      UPDATE_CONFLICT_MESSAGE
    );
    expect(screen.getByRole("textbox", { name: "集合場所名*" })).toHaveValue(
      "他の人の変更"
    );

    await user.click(screen.getByRole("button", { name: "保存する" }));
    await waitFor(() =>
      expect(update).toHaveBeenLastCalledWith(1, "他の人の変更", 1)
    );
  });

  it("競合後に一覧で見つからなければフォームを閉じて理由を一覧へ出す", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: [createSpot(1, "体育館前")],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
    const update = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(409, "conflict", "GATHERING_SPOT_UPDATE_CONFLICT")
      );
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list, update })} />);

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "集合場所名*" })
    ).not.toBeInTheDocument();
  });

  it("競合後の再取得に失敗したらフォームと入力を残し、再度の保存で最新の値へ置き換える", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: [createSpot(1, "体育館前")],
        total: 1,
        limit: 20,
        offset: 0,
      })
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue({
        items: [{ ...createSpot(1, "他の人の変更"), lockVersion: 1 }],
        total: 1,
        limit: 20,
        offset: 0,
      });
    const update = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(409, "conflict", "GATHERING_SPOT_UPDATE_CONFLICT")
      );
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list, update })} />);

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    const input = screen.getByRole("textbox", { name: "集合場所名*" });
    await user.clear(input);
    await user.type(input, "自分の変更");
    await user.upload(
      screen.getByLabelText("集合場所の画像を選択"),
      new File(["photo"], "photo.jpg", { type: "image/jpeg" })
    );
    await screen.findByRole("img", { name: "集合場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_RELOAD_FAILED_MESSAGE)
    ).toBeInTheDocument();
    expect(screen.queryByText(UPDATE_CONFLICT_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "集合場所名*" })).toHaveValue(
      "自分の変更"
    );
    expect(
      screen.getByRole("img", { name: "集合場所の画像" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(
      await screen.findByText(UPDATE_CONFLICT_MESSAGE)
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "集合場所名*" })).toHaveValue(
      "他の人の変更"
    );
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenLastCalledWith(1, "自分の変更", 0);
  });

  it("版の競合ではない409では入力を残す", async () => {
    const update = vi
      .fn()
      .mockRejectedValue(
        new ApiClientError(
          409,
          "使用中の集合場所は削除できません",
          "GATHERING_SPOT_IN_USE"
        )
      );
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ update })} />);

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    const input = screen.getByRole("textbox", { name: "集合場所名*" });
    await user.clear(input);
    await user.type(input, "自分の変更");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "使用中の集合場所は削除できません"
    );
    expect(input).toHaveValue("自分の変更");
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

  it("編集で選んだ写真を縮小してから集合場所の画像として登録する", async () => {
    const update = vi.fn().mockResolvedValue(createSpot(1, "体育館前"));
    const setImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <GatheringSpotsPage gateway={createGateway({ setImage, update })} />
    );

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.upload(
      screen.getByLabelText("集合場所の画像を選択"),
      new File(["photo"], "photo.jpg", { type: "image/jpeg" })
    );
    await screen.findByRole("img", { name: "集合場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledWith(1, resizedImage));
  });

  it("登録済みの画像を削除して保存すると、集合場所の画像を削除する", async () => {
    const spot = createSpot(1, "体育館前", "https://images.example.com/1.jpg");
    const list = vi.fn().mockResolvedValue({
      items: [spot],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const update = vi.fn().mockResolvedValue(spot);
    const deleteImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <GatheringSpotsPage
        gateway={createGateway({ deleteImage, list, update })}
      />
    );

    await screen.findByText("体育館前");
    await user.click(
      screen.getByRole("button", { name: "体育館前のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.click(screen.getByRole("button", { name: "画像を削除" }));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(deleteImage).toHaveBeenCalledWith(1));
  });

  it("一覧で画像が登録済みか未登録かを示す", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [
        createSpot(1, "体育館前", "https://images.example.com/1.jpg"),
        createSpot(2, "正門前"),
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });

    render(<GatheringSpotsPage gateway={createGateway({ list })} />);

    const registeredRow = (await screen.findByText("体育館前")).closest(
      "[role=row]"
    );
    const unregisteredRow = screen.getByText("正門前").closest("[role=row]");
    expect(registeredRow).toHaveTextContent("登録済み");
    expect(unregisteredRow).toHaveTextContent("未登録");
  });

  it("一覧の未登録を押すと、その集合場所の編集を開いて画像の選択へ移る", async () => {
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway()} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館前の画像：未登録" })
    );

    expect(
      screen.getByRole("heading", { name: "集合場所の編集" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "集合場所名*" })).toHaveValue(
      "体育館前"
    );
    expect(screen.getByLabelText("集合場所の画像を選択")).toHaveFocus();
  });

  it("一覧の登録済みを押すと、その集合場所の編集を開いて画像の選択へ移る", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createSpot(1, "体育館前", "https://images.example.com/1.jpg")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ list })} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館前の画像：登録済み" })
    );

    expect(
      screen.getByRole("heading", { name: "集合場所の編集" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("集合場所の画像を選択")).toHaveFocus();
  });

  it("写真の読み込みが終わるまでは保存できない", async () => {
    let finishResize: (image: Blob) => void = () => {};
    vi.mocked(resizeImage).mockReturnValue(
      new Promise((resolve) => {
        finishResize = resolve;
      })
    );
    const update = vi.fn();
    const user = userEvent.setup();

    render(<GatheringSpotsPage gateway={createGateway({ update })} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館前の画像：未登録" })
    );
    await user.upload(
      screen.getByLabelText("集合場所の画像を選択"),
      new File(["photo"], "photo.jpg", { type: "image/jpeg" })
    );

    expect(screen.getByRole("button", { name: "保存する" })).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: "集合場所名*" }),
      "{Enter}"
    );
    expect(update).not.toHaveBeenCalled();

    finishResize(resizedImage);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "保存する" })).toBeEnabled()
    );
  });

  it("新規登録で画像だけ失敗したとき、保存し直すと集合場所を作り直さずに画像を登録する", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ ...createSpot(2, "正門前"), lockVersion: 5 });
    const update = vi.fn().mockResolvedValue(createSpot(2, "正門前"));
    const setImage = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError(
          400,
          "画像はJPEG・PNG・WebP形式の5MB以下のファイルを指定してください",
          "INVALID_PLACE_IMAGE"
        )
      )
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    render(
      <GatheringSpotsPage
        gateway={createGateway({ create, setImage, update })}
      />
    );

    await screen.findByText("体育館前");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "集合場所名*" }),
      "正門前"
    );
    await user.upload(
      screen.getByLabelText("集合場所の画像を選択"),
      new File(["photo"], "photo.jpg", { type: "image/jpeg" })
    );
    await screen.findByRole("img", { name: "集合場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "画像はJPEG・PNG・WebP形式の5MB以下のファイルを指定してください"
    );
    expect(
      screen.getByRole("heading", { name: "集合場所の編集" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledTimes(2));
    expect(create).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(2, "正門前", 5);
  });
});
