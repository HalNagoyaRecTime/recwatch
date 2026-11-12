import { describe, expect, it, vi } from "vitest";

import { loadAllPages } from "./load-all-pages";

describe("loadAllPages", () => {
  it("返った件数がlimitより少ないページまで、取得済み件数をoffsetにして取得する", async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce([1, 2])
      .mockResolvedValueOnce([3, 4])
      .mockResolvedValueOnce([5]);

    await expect(loadAllPages(loadPage, { pageSize: 2 })).resolves.toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(loadPage.mock.calls).toEqual([
      [0, 2],
      [2, 2],
      [4, 2],
    ]);
  });

  it("件数がlimitちょうどで割り切れるときは、次の空ページで終了する", async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce([1, 2])
      .mockResolvedValueOnce([]);

    await expect(loadAllPages(loadPage, { pageSize: 2 })).resolves.toEqual([
      1, 2,
    ]);
    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it("空ページを受け取ったら終了する", async () => {
    const loadPage = vi.fn().mockResolvedValue([]);

    await expect(loadAllPages(loadPage)).resolves.toEqual([]);
    expect(loadPage).toHaveBeenCalledTimes(1);
  });

  it("limitちょうどのページが続いたままmaxPagesを超えたら失敗する", async () => {
    const loadPage = vi
      .fn()
      .mockImplementation((offset: number) => Promise.resolve([offset + 1]));

    await expect(
      loadAllPages(loadPage, { maxPages: 2, pageSize: 1 })
    ).rejects.toThrow("一覧データの取得上限を超えました。");
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
