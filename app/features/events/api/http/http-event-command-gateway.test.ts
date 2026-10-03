import { describe, expect, it, vi } from "vitest";

import { createHttpEventCommandGateway } from "./http-event-command-gateway";

const input = {
  endTime: "12:30",
  name: "リレー",
  rules: "バトンを落とさない",
  startTime: "11:00",
  venueIds: [3, 4],
};

const response = {
  event_id: 12,
  event_name: "リレー",
  rule_text: "バトンを落とさない",
  venues: [
    { venue_id: 3, venue_name: "メインコート" },
    { venue_id: 4, venue_name: "サブコート" },
  ],
  start_time: "1100",
  end_time: "1230",
};

describe("createHttpEventCommandGateway", () => {
  it("作成時にvenue_idsとHHMMへ変換し、Event IDを返す", async () => {
    const post = vi.fn().mockResolvedValue(response);
    const gateway = createHttpEventCommandGateway({
      post,
      put: vi.fn(),
      delete: vi.fn(),
    });

    await expect(gateway.create(input)).resolves.toEqual({ id: 12 });
    expect(post).toHaveBeenCalledWith("/api/v1/events", {
      event_name: "リレー",
      rule_text: "バトンを落とさない",
      venue_ids: [3, 4],
      start_time: "1100",
      end_time: "1230",
    });
  });

  it("更新時も同じwrite DTOを使う", async () => {
    const put = vi.fn().mockResolvedValue(response);
    const gateway = createHttpEventCommandGateway({
      post: vi.fn(),
      put,
      delete: vi.fn(),
    });

    await expect(gateway.update(12, input)).resolves.toBeUndefined();
    expect(put).toHaveBeenCalledWith("/api/v1/events/12", {
      event_name: "リレー",
      rule_text: "バトンを落とさない",
      venue_ids: [3, 4],
      start_time: "1100",
      end_time: "1230",
    });
  });

  it("削除時はイベントAPIのIDを指定する", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const gateway = createHttpEventCommandGateway({
      post: vi.fn(),
      put: vi.fn(),
      delete: remove,
    });

    await gateway.delete(12);

    expect(remove).toHaveBeenCalledWith("/api/v1/events/12");
  });

  it("保存レスポンスが不正なら成功扱いにしない", async () => {
    const gateway = createHttpEventCommandGateway({
      post: vi.fn().mockResolvedValue({ event_id: 12 }),
      put: vi.fn(),
      delete: vi.fn(),
    });

    await expect(gateway.create(input)).rejects.toThrow(
      "イベント保存のレスポンス形式が正しくありません。"
    );
  });
});
