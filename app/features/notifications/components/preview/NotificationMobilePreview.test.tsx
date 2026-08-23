import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NotificationMobilePreview } from "~/features/notifications/components/preview/NotificationMobilePreview";
import { initialNotificationDraft } from "~/features/notifications/model/notification-draft";

afterEach(cleanup);

describe("NotificationMobilePreview", () => {
  it("通知のアプリアイコンにrecwatchロゴを表示する", () => {
    const { container } = render(
      <NotificationMobilePreview draft={initialNotificationDraft} />
    );

    expect(
      container.querySelector('img[src="/recwatch-logo.svg"]')
    ).toBeInTheDocument();
  });
});
