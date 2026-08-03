import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { httpAdminNotificationManagementGateway } from "~/features/notifications/infrastructure/http-admin-notification-management-gateway";
import type { NotificationManagementPage } from "~/features/notifications/pages/NotificationManagementPage";
import { httpNotificationAudienceLoader } from "~/features/notifications/infrastructure/http-notification-audience-loader";
import { httpNotificationSubmitter } from "~/features/notifications/infrastructure/http-notification-submitter";
import type { NotificationCreatePage } from "~/features/notifications/pages/NotificationCreatePage";
import NotificationsNewRoute from "~/routes/main/notifications.new";
import NotificationsRoute from "~/routes/main/notifications";

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
    const layout = NotificationsRoute();

    expect(isValidElement(layout)).toBe(true);

    const pagePadding = layout.props.children;
    expect(isValidElement(pagePadding)).toBe(true);

    const element = pagePadding.props
      .children as ReactElement<NotificationManagementPageProps>;
    expect(isValidElement(element)).toBe(true);
    expect(element.props.gateway).toBe(httpAdminNotificationManagementGateway);
  });
});
