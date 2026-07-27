import { describe, expect, it } from "vitest";

import { NotificationManagementError } from "../application/notification-management-error";
import { toAdminNotificationUpdateRequest } from "./admin-notification-update-mapper";

describe("toAdminNotificationUpdateRequest", () => {
  it("空の更新を拒否する", () => {
    expect(() => toAdminNotificationUpdateRequest({})).toThrow(
      new NotificationManagementError("invalid_request")
    );
  });

  it("空白だけのタイトルを拒否する", () => {
    expect(() => toAdminNotificationUpdateRequest({ title: "  " })).toThrow(
      new NotificationManagementError("invalid_request")
    );
  });
});
