import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearAccountPhotoRequestState,
  requestAccountPhoto,
} from "./accountPhotoRequest";

afterEach(() => clearAccountPhotoRequestState());

describe("requestAccountPhoto", () => {
  it("同じ利用者の同時リクエストを1回に束ねる", async () => {
    const photo = new Blob(["photo"], { type: "image/jpeg" });
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "image/jpeg" }),
      blob: vi.fn().mockResolvedValue(photo),
    } as Partial<Response> as Response);

    const first = requestAccountPhoto("user-1", "/photo", {}, fetcher);
    const second = requestAccountPhoto("user-1", "/photo", {}, fetcher);

    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("404だった利用者の画像を同一セッション中に再取得しない", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      requestAccountPhoto("user-1", "/photo", {}, fetcher)
    ).resolves.toBeNull();
    await expect(
      requestAccountPhoto("user-1", "/photo", {}, fetcher)
    ).resolves.toBeNull();

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
