import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { httpAdminNotificationManagementGateway } from "~/features/notification-management/infrastructure/http-admin-notification-management-gateway";
import type { NotificationManagementPage } from "~/features/notification-management/pages/NotificationManagementPage";
import { httpNotificationAudienceLoader } from "~/features/notifications/infrastructure/http-notification-audience-loader";
import { httpNotificationSubmitter } from "~/features/notifications/infrastructure/http-notification-submitter";
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
    expect(element.props.submitter).toBe(httpNotificationSubmitter);
    expect(element.props.audienceLoader).toBe(httpNotificationAudienceLoader);
    expect(element.props.isSubmissionEnabled).not.toBe(false);
  });

  it("通知管理画面へHTTP Gatewayを注入する", () => {
    const element =
      NotificationsRoute() as ReactElement<NotificationManagementPageProps>;

    expect(isValidElement(element)).toBe(true);
    expect(element.props.gateway).toBe(httpAdminNotificationManagementGateway);
  });
});
