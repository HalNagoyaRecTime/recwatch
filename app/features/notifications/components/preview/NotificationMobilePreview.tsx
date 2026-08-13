import { Bell } from "lucide-react";

import { MobileDeviceFrame } from "~/components/ui/layout/MobileDeviceFrame";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationMobilePreviewProps = {
  draft: NotificationDraft;
  mode: NotificationPreviewMode;
};

export type NotificationPreviewMode =
  | "lock-screen"
  | "notification-detail"
  | "data-display";

export function NotificationMobilePreview({
  draft,
  mode,
}: NotificationMobilePreviewProps) {
  if (mode !== "lock-screen") {
    return (
      <div
        aria-label="モバイルプレビュー（未実装）"
        role="status"
        className="text-text-subtle flex aspect-9/20 h-[clamp(18.75rem,calc(100cqh-2.25rem),44.444rem)] w-auto shrink-0 items-center justify-center text-sm"
      >
        未実装
      </div>
    );
  }

  return (
    <div className="aspect-9/20 h-[clamp(18.75rem,calc(100cqh-2.25rem),44.444rem)] w-auto shrink-0">
      <MobileDeviceFrame>
        <div className="relative h-full overflow-hidden bg-[linear-gradient(160deg,#6687bf,#91b3df_55%,#d5e4f5)]">
          <div className="pt-[22cqw] text-center text-white">
            <p className="text-[19cqw] leading-none font-light tracking-tight">
              9:30
            </p>
            <p className="mt-[2cqw] text-[4.5cqw]">7月14日 火曜日</p>
          </div>

          <div className="mx-[4cqw] mt-[9cqw] rounded-[5.5cqw] bg-white/92 p-[3.5cqw] text-slate-900 shadow-lg backdrop-blur-md">
            <div className="flex items-start gap-[3cqw]">
              <span className="relative flex size-[9cqw] shrink-0 items-center justify-center rounded-[2.5cqw] bg-white shadow-sm">
                <span className="absolute left-[1.5cqw] size-[5cqw] rounded-full bg-blue-600" />
                <span className="absolute right-[1.5cqw] size-[5cqw] rounded-full bg-yellow-300" />
                <Bell
                  aria-hidden="true"
                  className="relative size-[3.5cqw] text-white"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[2cqw]">
                  <p className="text-[3.5cqw] font-semibold">recwatch</p>
                  <span className="text-[2.5cqw] text-slate-500">たった今</span>
                </div>
                <p className="mt-[1cqw] truncate text-[4cqw] font-semibold">
                  {draft.title || "通知の件名が表示されます"}
                </p>
                <p className="mt-[0.5cqw] line-clamp-3 text-[3.25cqw] leading-relaxed text-slate-600">
                  {draft.body || "入力した通知本文がここに表示されます。"}
                </p>
              </div>
            </div>
          </div>

          <p className="absolute inset-x-0 bottom-[5cqw] text-center text-[3.5cqw] text-white/90">
            上にスワイプして開く
          </p>
        </div>
      </MobileDeviceFrame>
    </div>
  );
}
