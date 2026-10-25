import { useState } from "react";

import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { NotificationInformationPreview } from "~/features/notifications/components/preview/NotificationInformationPreview";
import type { AdminNotificationDetail } from "~/features/notifications/api/contracts/admin-notification-types";
import type { NotificationAudienceOption } from "~/features/notifications/model/notification-audience";
import {
  NotificationMobilePreview,
  type NotificationPreviewMode,
} from "~/features/notifications/components/preview/NotificationMobilePreview";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

const notificationPreviewOptions = [
  { label: "ロック画面", value: "lock-screen" },
  { label: "通知詳細", value: "notification-detail" },
  { label: "通知情報", value: "data-display" },
] as const;

type NotificationPreviewPanelProps = {
  draft: NotificationDraft;
  notification?: AdminNotificationDetail | null;
  audienceOptions?: NotificationAudienceOption[];
};

export function NotificationPreviewPanel({
  draft,
  notification,
  audienceOptions,
}: NotificationPreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<
    NotificationPreviewMode | "data-display"
  >("notification-detail");

  return (
    <div className="bg-surface-layout flex h-full min-h-0 w-full min-w-0 flex-col">
      <header className="main-header-height border-border-base flex shrink-0 items-center justify-start border-b px-3">
        <SegmentedControl
          ariaLabel="プレビューの表示形式"
          behavior="selection"
          onValueChange={setPreviewMode}
          options={notificationPreviewOptions}
          value={previewMode}
        />
      </header>

      <ScrollbarArea className="@container-[size] min-h-0 flex-1">
        <div className="flex min-h-full min-w-0 items-start justify-center p-3">
          {previewMode === "data-display" ? (
            <NotificationInformationPreview
              draft={draft}
              notification={notification}
              audienceOptions={audienceOptions}
            />
          ) : (
            <NotificationMobilePreview draft={draft} mode={previewMode} />
          )}
        </div>
      </ScrollbarArea>

      <footer className="main-footer-height border-border-base flex shrink-0 items-center justify-center border-t px-4">
        <span className="text-text-muted text-sm">プレビュー</span>
      </footer>
    </div>
  );
}
