import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import NotificationsNewRoute from "~/routes/main/notifications.new";
import NotificationsRoute from "~/routes/main/notifications";

describe("notification routes", () => {
  it("通知作成画面をAPI依存なしで構成する", () => {
    const element = NotificationsNewRoute();

    expect(isValidElement(element)).toBe(true);
    expect(element.props).toEqual({});
  });

  it("通知管理画面をAPI依存なしで構成する", () => {
    const layout = NotificationsRoute();

    expect(isValidElement(layout)).toBe(true);

    const pagePadding = layout.props.children;
    expect(isValidElement(pagePadding)).toBe(true);

    const element = pagePadding.props.children;
    expect(isValidElement(element)).toBe(true);
    expect(element.props).toEqual({});
  });
});
