import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { httpNotificationManagementApi } from "~/features/notifications/api/http/notification-management-api";
import type { NotificationManagementPage } from "~/features/notification-management/pages/NotificationManagementPage";
import { httpNotificationAudienceApi } from "~/features/notifications/api/http/notification-audience-api";
import { httpNotificationSubmissionApi } from "~/features/notifications/api/http/notification-submission-api";
import type { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import NotificationsNewRoute from "./notifications.new";
import NotificationsRoute from "./notifications";

type NotificationCreatePageProps = Parameters<typeof NotificationCreatePage>[0];
type NotificationManagementPageProps = Parameters<
  typeof NotificationManagementPage
>[0];

describe("notification routes", () => {
  it("通知作成画面へHTTP依存を注入する", () => {
    const element =
      NotificationsNewRoute() as ReactElement<NotificationCreatePageProps>;

    expect(isValidElement(element)).toBe(true);
    expect(element.props.api).toBe(httpNotificationSubmissionApi);
    expect(element.props.audienceApi).toBe(httpNotificationAudienceApi);
    expect(element.props.isSubmissionEnabled).not.toBe(false);
  });

  it("通知管理画面へHTTP Gatewayを注入する", () => {
    const layout = NotificationsRoute();

    expect(isValidElement(layout)).toBe(true);

    const pagePadding = layout.props.children;
    expect(isValidElement(pagePadding)).toBe(true);

    const element = pagePadding.props
      .children as ReactElement<NotificationManagementPageProps>;
    expect(isValidElement(element)).toBe(true);
    expect(element.props.api).toBe(httpNotificationManagementApi);
  });
});
