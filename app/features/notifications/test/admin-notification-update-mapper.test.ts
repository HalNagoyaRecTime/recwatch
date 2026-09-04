import { describe, expect, it } from "vitest";

import { ClientError, ClientErrors } from "~/lib/client-error";
import { toAdminNotificationUpdateRequest } from "~/features/notifications/api/mappers/admin-notification-update-mapper";

describe("toAdminNotificationUpdateRequest", () => {
  it("空の更新を拒否する", () => {
    expect(() => toAdminNotificationUpdateRequest({})).toThrow(
      new ClientError(ClientErrors.INVALID_REQUEST)
    );
  });

  it("空白だけのタイトルを拒否する", () => {
    expect(() => toAdminNotificationUpdateRequest({ title: "  " })).toThrow(
      new ClientError(ClientErrors.INVALID_REQUEST)
    );
  });

  it("集合対象をBackendのgathering契約へ変換する", () => {
    expect(
      toAdminNotificationUpdateRequest({
        audience: { type: "gathering", gatheringId: 23 },
      })
    ).toEqual({
      audience: { type: "gathering", gatheringId: 23 },
    });
  });
});
