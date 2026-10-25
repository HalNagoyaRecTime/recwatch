import { ArrowLeft } from "lucide-react";

import { MarkdownContent } from "~/components/ui/markdown/MarkdownContent";
import { MobileDeviceFrame } from "~/components/ui/layout/MobileDeviceFrame";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationMobilePreviewProps = {
  draft: NotificationDraft;
  mode: NotificationPreviewMode;
};

export type NotificationPreviewMode =
  "lock-screen" | "notification-detail" | "data-display";

export function NotificationMobilePreview({
  draft,
  mode,
}: NotificationMobilePreviewProps) {
  const frameClassName =
    "w-[min(100%,390px,max(270px,calc((100cqh-24px)*0.45)))] min-w-0 shrink-0 self-start";

  if (mode === "data-display") {
    return (
      <div className={frameClassName}>
        <div className="border-border-base bg-surface-base rounded-xl border p-4">
          <h3 className="text-text-base mb-3 text-sm font-semibold">
            入力中の通知データ
          </h3>
          <pre className="text-text-muted overflow-x-auto text-xs leading-6 break-all whitespace-pre-wrap">
            {JSON.stringify(draft, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (mode === "notification-detail") {
    const scheduledAt = draft.scheduledAt ? new Date(draft.scheduledAt) : null;
    const dateLabel =
      scheduledAt && !Number.isNaN(scheduledAt.getTime())
        ? new Intl.DateTimeFormat("ja-JP", {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(scheduledAt)
        : "配信日時";
    return (
      <div className={frameClassName} aria-label="モバイルの通知詳細プレビュー">
        <MobileDeviceFrame appearance="light">
          <div className="flex h-full flex-col bg-white text-[#333333]">
            <div className="shrink-0 border-b border-slate-100 bg-white pt-[12cqw]">
              <div className="flex h-[14cqw] items-center px-[4cqw] text-[#666666]">
                <ArrowLeft aria-hidden="true" className="size-[6cqw]" />
                <span className="ml-[3cqw] text-[4cqw] font-semibold">
                  戻る
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[2.6cqw] py-[3cqw]">
              <h3 className="mt-[4cqw] text-[5.65cqw] leading-snug font-extrabold break-words text-black">
                {draft.detailTitle || "通知の詳細タイトル"}
              </h3>
              <p className="mt-[1cqw] text-[3.6cqw] font-medium text-[#333333]">
                {dateLabel}
              </p>
              <hr className="my-[3cqw] border-slate-200" />
              <div className="text-[4.1cqw] leading-[7.7cqw] font-medium [&_h1]:text-[6.2cqw] [&_h2]:text-[5.2cqw] [&_h3]:text-[4.6cqw] [&>div]:text-inherit">
                <MarkdownContent
                  content={
                    draft.detailBody || "入力した詳細本文がここに表示されます。"
                  }
                />
              </div>
            </div>
            <div className="h-[6cqw] shrink-0 bg-white" />
          </div>
        </MobileDeviceFrame>
      </div>
    );
  }
  return (
    <div className={frameClassName}>
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
              <img
                src="/rectime-app-icon.png"
                alt="RE:CREATION"
                className="size-[9cqw] shrink-0 rounded-[2cqw] object-contain"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[2cqw]">
                  <p className="truncate text-[3.5cqw] font-semibold">
                    {draft.title || "タイトル"}
                  </p>
                  <span className="text-[2.5cqw] whitespace-nowrap text-slate-500">
                    たった今
                  </span>
                </div>
                <p className="mt-[0.5cqw] line-clamp-3 text-[3.25cqw] leading-relaxed text-slate-600">
                  {draft.body || "本文"}
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
