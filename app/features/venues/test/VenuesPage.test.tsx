import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "~/lib/api-client-error";
import { resizeImage } from "~/lib/resize-image";
import type { VenueGateway } from "~/features/venues/api/contracts/venue-gateway";
import type { Venue } from "~/features/venues/model/venue";
import { VenuesPage } from "~/features/venues/pages/VenuesPage";

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

function createPhoto() {
  return new File(["photo"], "photo.jpg", { type: "image/jpeg" });
}

function createVenue(
  id: number,
  name: string,
  imageUrl: string | null = null
): Venue {
  return {
    id,
    name,
    imageUrl,
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
    setImage: vi.fn().mockResolvedValue(undefined),
    deleteImage: vi.fn().mockResolvedValue(undefined),
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

  it("編集で選んだ写真を縮小してから実施場所の画像として登録する", async () => {
    const update = vi.fn().mockResolvedValue(createVenue(1, "体育館"));
    const setImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    const photo = createPhoto();

    render(<VenuesPage gateway={createGateway({ setImage, update })} />);

    await screen.findByText("体育館");
    await user.click(
      screen.getByRole("button", { name: "体育館のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.upload(screen.getByLabelText("実施場所の画像を選択"), photo);
    expect(
      await screen.findByRole("img", { name: "実施場所の画像" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledWith(1, resizedImage));
    expect(resizeImage).toHaveBeenCalledWith(photo);
  });

  it("新規登録で選んだ画像を、作成した実施場所に登録する", async () => {
    const create = vi.fn().mockResolvedValue(createVenue(2, "グラウンド"));
    const setImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ create, setImage })} />);

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "実施場所名*" }),
      "グラウンド"
    );
    await user.upload(
      screen.getByLabelText("実施場所の画像を選択"),
      createPhoto()
    );
    await screen.findByRole("img", { name: "実施場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledWith(2, resizedImage));
    expect(
      screen.queryByRole("textbox", { name: "実施場所名*" })
    ).not.toBeInTheDocument();
  });

  it("新規登録で画像だけ失敗したとき、保存し直すと実施場所を作り直さずに画像を登録する", async () => {
    const create = vi.fn().mockResolvedValue(createVenue(2, "グラウンド"));
    const update = vi.fn().mockResolvedValue(createVenue(2, "グラウンド"));
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
      <VenuesPage gateway={createGateway({ create, setImage, update })} />
    );

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.type(
      screen.getByRole("textbox", { name: "実施場所名*" }),
      "グラウンド"
    );
    await user.upload(
      screen.getByLabelText("実施場所の画像を選択"),
      createPhoto()
    );
    await screen.findByRole("img", { name: "実施場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "画像はJPEG・PNG・WebP形式の5MB以下のファイルを指定してください"
    );
    expect(
      screen.getByRole("heading", { name: "実施場所の編集" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledTimes(2));
    expect(create).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(2, "グラウンド");
  });

  it("登録済みの画像を削除して保存すると、実施場所の画像を削除する", async () => {
    const venue = createVenue(1, "体育館", "https://images.example.com/1.jpg");
    const list = vi.fn().mockResolvedValue({
      items: [venue],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const update = vi.fn().mockResolvedValue(venue);
    const deleteImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <VenuesPage gateway={createGateway({ deleteImage, list, update })} />
    );

    await screen.findByText("体育館");
    await user.click(
      screen.getByRole("button", { name: "体育館のその他の操作" })
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("img", { name: "実施場所の画像" })).toHaveAttribute(
      "src",
      "https://images.example.com/1.jpg"
    );
    await user.click(screen.getByRole("button", { name: "画像を削除" }));
    expect(screen.getByText("画像を選択")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(deleteImage).toHaveBeenCalledWith(1));
  });

  it("読み込めない画像を選んだときは、選び直すよう伝える", async () => {
    vi.mocked(resizeImage).mockRejectedValue(new Error("decode failed"));
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway()} />);

    await screen.findByText("体育館");
    await user.click(screen.getByRole("button", { name: "新規登録" }));
    await user.upload(
      screen.getByLabelText("実施場所の画像を選択"),
      createPhoto()
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "画像を読み込めませんでした。JPEG・PNG・WebP の画像を選択してください。"
    );
    expect(screen.getByText("画像を選択")).toBeInTheDocument();
  });

  it("一覧で画像が登録済みか未登録かを示す", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [
        createVenue(1, "体育館", "https://images.example.com/1.jpg"),
        createVenue(2, "グラウンド"),
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });

    render(<VenuesPage gateway={createGateway({ list })} />);

    const registeredRow = (await screen.findByText("体育館")).closest(
      "[role=row]"
    );
    const unregisteredRow = screen
      .getByText("グラウンド")
      .closest("[role=row]");
    expect(registeredRow).toHaveTextContent("登録済み");
    expect(unregisteredRow).toHaveTextContent("未登録");
  });

  it("一覧の未登録を押すと、その実施場所の編集を開いて画像の選択へ移る", async () => {
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway()} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館の画像を登録" })
    );

    expect(
      screen.getByRole("heading", { name: "実施場所の編集" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "実施場所名*" })).toHaveValue(
      "体育館"
    );
    expect(screen.getByLabelText("実施場所の画像を選択")).toHaveFocus();
  });

  it("画像の枠を押して選んだ写真も、実施場所の画像として登録する", async () => {
    const update = vi.fn().mockResolvedValue(createVenue(1, "体育館"));
    const setImage = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ setImage, update })} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館の画像を登録" })
    );
    const previewArea = screen.getByText("画像を選択").closest("label");
    if (!previewArea) throw new Error("画像の枠が見つかりません");
    await user.upload(previewArea, createPhoto());
    await screen.findByRole("img", { name: "実施場所の画像" });
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(setImage).toHaveBeenCalledWith(1, resizedImage));
  });

  it("一覧の登録済みを押すと、その実施場所の編集を開いて画像の選択へ移る", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [createVenue(1, "体育館", "https://images.example.com/1.jpg")],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const user = userEvent.setup();

    render(<VenuesPage gateway={createGateway({ list })} />);

    await user.click(
      await screen.findByRole("button", { name: "体育館の画像を変更" })
    );

    expect(
      screen.getByRole("heading", { name: "実施場所の編集" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("実施場所の画像を選択")).toHaveFocus();
  });
});
