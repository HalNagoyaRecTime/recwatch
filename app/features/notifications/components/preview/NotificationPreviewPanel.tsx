import { useState } from "react";

import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import {
  NotificationMobilePreview,
  type NotificationPreviewMode,
} from "~/features/notifications/components/preview/NotificationMobilePreview";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

const notificationPreviewOptions = [
  { label: "ロック画面", value: "lock-screen" },
  { label: "通知詳細", value: "notification-detail" },
] as const;

type NotificationPreviewPanelProps = {
  draft: NotificationDraft;
};

export function NotificationPreviewPanel({
  draft,
}: NotificationPreviewPanelProps) {
  const [previewMode, setPreviewMode] =
    useState<NotificationPreviewMode>("lock-screen");

  return (
    <div className="bg-surface-layout flex h-full w-fit min-w-0 flex-col">
      <header className="main-header-height border-border-base flex min-w-0 shrink-0 items-center justify-center border-b pr-30 pl-4">
        <SegmentedControl
          ariaLabel="プレビューの表示形式"
          behavior="selection"
          onValueChange={setPreviewMode}
          options={notificationPreviewOptions}
          value={previewMode}
        />
      </header>

      <ScrollbarArea className="@container-[size] min-w-0">
        <div className="flex min-h-full min-w-0 justify-center px-4 py-4.5">
          <NotificationMobilePreview draft={draft} mode={previewMode} />
        </div>
      </ScrollbarArea>

      <footer className="main-footer-height border-border-base flex shrink-0 items-center justify-center border-t px-4">
        <span className="text-text-muted text-sm">モバイルプレビュー</span>
      </footer>
    </div>
  );
}
