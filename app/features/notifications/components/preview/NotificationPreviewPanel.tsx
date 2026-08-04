import { useState } from "react";

import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { NotificationMobilePreview } from "~/features/notifications/components/preview/NotificationMobilePreview";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

const notificationPreviewOptions = [
  { label: "ロック画面", value: "lock-screen" },
  { label: "通知詳細", value: "notification-detail" },
  { label: "データ表示", value: "data-display" },
] as const;

type NotificationPreviewMode =
  (typeof notificationPreviewOptions)[number]["value"];

type NotificationPreviewPanelProps = {
  draft: NotificationDraft;
};

export function NotificationPreviewPanel({
  draft,
}: NotificationPreviewPanelProps) {
  const [previewMode, setPreviewMode] =
    useState<NotificationPreviewMode>("lock-screen");

  return (
    <div className="bg-surface-layout flex h-full w-fit flex-col">
      <header className="main-header-height border-border-base flex shrink-0 items-center justify-center border-b px-4">
        <SegmentedControl
          ariaLabel="モバイルプレビューの表示形式"
          behavior="selection"
          onValueChange={setPreviewMode}
          options={notificationPreviewOptions}
          value={previewMode}
        />
      </header>

      <ScrollbarArea className="@container-[size]">
        <div className="flex min-h-full justify-center p-4.5">
          <NotificationMobilePreview draft={draft} />
        </div>
      </ScrollbarArea>

      <footer className="main-footer-height border-border-base flex shrink-0 items-center justify-center border-t px-4">
        <span className="text-text-muted text-sm">モバイルプレビュー</span>
      </footer>
    </div>
  );
}
