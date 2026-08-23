import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import { NotificationMobilePreview } from "~/features/notifications/components/preview/NotificationMobilePreview";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationPreviewPanelProps = {
  draft: NotificationDraft;
};

export function NotificationPreviewPanel({
  draft,
}: NotificationPreviewPanelProps) {
  return (
    <section
      aria-label="通知プレビュー"
      className="bg-surface-layout flex h-full w-[clamp(16rem,24vw,21rem)] min-w-0 flex-col"
    >
      <header className="main-header-height border-border-base flex shrink-0 items-center justify-center border-b px-4">
        <span className="text-text-muted text-sm">ロック画面プレビュー</span>
      </header>

      <ScrollbarArea className="@container-[size] min-w-0">
        <div className="flex min-h-full min-w-0 justify-center overflow-hidden p-4.5">
          <NotificationMobilePreview draft={draft} />
        </div>
      </ScrollbarArea>

      <footer className="main-footer-height border-border-base flex shrink-0 items-center justify-center border-t px-4">
        <span className="text-text-muted text-sm">プレビュー</span>
      </footer>
    </section>
  );
}
