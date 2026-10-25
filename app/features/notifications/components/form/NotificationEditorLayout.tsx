import type { ReactNode } from "react";

import { NotificationPreviewPanel } from "~/features/notifications/components/preview/NotificationPreviewPanel";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export function NotificationEditorLayout({
  children,
  draft,
}: {
  children: ReactNode;
  draft: NotificationDraft;
}) {
  return (
    <div className="grid min-w-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_clamp(340px,28vw,430px)]">
      <div className="min-w-0">{children}</div>
      <aside className="border-border-base min-w-0 border-t xl:border-t-0 xl:border-l">
        <div className="h-[calc(100dvh-var(--main-header-total-height))] min-h-[420px] xl:sticky xl:top-[var(--main-header-total-height)] xl:h-[calc(100dvh-var(--main-header-total-height))]">
          <NotificationPreviewPanel draft={draft} />
        </div>
      </aside>
    </div>
  );
}
