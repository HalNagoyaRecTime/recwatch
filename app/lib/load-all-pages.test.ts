import { describe, expect, it, vi } from "vitest";

import { loadAllPages } from "./load-all-pages";

describe("loadAllPages", () => {
  it("複数ページを実取得件数のoffsetで最後まで取得する", async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce({ items: [1, 2], total: 5 })
      .mockResolvedValueOnce({ items: [3], total: 5 })
      .mockResolvedValueOnce({ items: [4, 5], total: 5 });

    await expect(loadAllPages(loadPage, { pageSize: 2 })).resolves.toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(loadPage.mock.calls).toEqual([
      [0, 2],
      [2, 2],
      [3, 2],
    ]);
  });

  it("1ページでtotal件に達したら終了する", async () => {
    const loadPage = vi.fn().mockResolvedValue({ items: [1, 2], total: 2 });

    await expect(loadAllPages(loadPage)).resolves.toEqual([1, 2]);
    expect(loadPage).toHaveBeenCalledTimes(1);
  });

  it("空ページを受け取ったら終了する", async () => {
    const loadPage = vi.fn().mockResolvedValue({ items: [], total: 0 });

    await expect(loadAllPages(loadPage)).resolves.toEqual([]);
    expect(loadPage).toHaveBeenCalledTimes(1);
  });

  it("totalに到達しないままmaxPagesを超えたら失敗する", async () => {
    const loadPage = vi.fn().mockImplementation((offset: number) =>
      Promise.resolve({
        items: [offset + 1],
        total: 100,
      })
    );

    await expect(
      loadAllPages(loadPage, { maxPages: 2, pageSize: 1 })
    ).rejects.toThrow("一覧データの取得上限を超えました。");
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
