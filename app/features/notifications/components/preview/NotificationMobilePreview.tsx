import {
  formatNotificationDateTime,
  formatNotificationClockTime,
  formatNotificationClockDate,
} from "~/features/notifications/components/notification-display";
import { useCurrentMinute } from "~/hooks/useCurrentMinute";
import { parseNotificationScheduledAt } from "~/features/notifications/model/notification-schedule-time";
import { ArrowLeft } from "lucide-react";

import { NotificationMarkdownContent } from "~/features/notifications/components/preview/NotificationMarkdownContent";
import { MobileDeviceFrame } from "~/components/ui/layout/MobileDeviceFrame";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationMobilePreviewProps = {
  draft: NotificationDraft;
  mode: NotificationPreviewMode;
};

export type NotificationPreviewMode = "lock-screen" | "notification-detail";

export function NotificationMobilePreview({
  draft,
  mode,
}: NotificationMobilePreviewProps) {
  const currentTime = useCurrentMinute();
  const timeLabel = formatNotificationClockTime(currentTime);
  const frameClassName =
    "w-[min(100%,390px,max(270px,calc((100cqh-24px)*0.45)))] min-w-0 shrink-0 self-start";

  if (mode === "notification-detail") {
    const dateLabel =
      draft.deliveryTiming === "scheduled"
        ? formatNotificationDateTime(
            parseNotificationScheduledAt(draft.scheduledAt) ?? undefined,
            "配信日時"
          )
        : formatNotificationDateTime(currentTime ?? undefined);
    return (
      <div className={frameClassName} aria-label="モバイルの通知詳細プレビュー">
        <MobileDeviceFrame timeLabel={timeLabel}>
          <div className="flex h-full flex-col bg-white text-neutral-800 dark:bg-black dark:text-neutral-100">
            <div className="border-border-subtle shrink-0 border-b bg-white pt-[12cqw] dark:bg-black">
              <div className="flex h-[14cqw] items-center px-[4cqw] text-neutral-600 dark:text-neutral-300">
                <ArrowLeft aria-hidden="true" className="size-[6cqw]" />
                <span className="ml-[3cqw] text-[4cqw] font-semibold">
                  戻る
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[2.6cqw] py-[3cqw]">
              <h3 className="mt-[4cqw] text-[5.65cqw] leading-snug font-extrabold break-words text-black dark:text-white">
                {draft.detailTitle || "通知の詳細タイトル"}
              </h3>
              <p className="mt-[1cqw] text-[3.6cqw] font-medium text-neutral-700 dark:text-neutral-300">
                {dateLabel}
              </p>
              <hr className="border-border-base my-[3cqw]" />
              <div className="text-[4.1cqw] leading-[7.7cqw] font-medium [&_h1]:text-[6.2cqw] [&_h2]:text-[5.2cqw] [&_h3]:text-[4.6cqw] [&>div]:text-inherit">
                <NotificationMarkdownContent
                  content={
                    draft.detailBody || "入力した詳細本文がここに表示されます。"
                  }
                />
              </div>
            </div>
            <div className="h-[6cqw] shrink-0 bg-white dark:bg-black" />
          </div>
        </MobileDeviceFrame>
      </div>
    );
  }
  return (
    <div className={frameClassName}>
      <MobileDeviceFrame appearance="dark" timeLabel={timeLabel}>
        <div className="relative h-full overflow-hidden bg-[linear-gradient(160deg,#6687bf,#91b3df_55%,#d5e4f5)] dark:bg-[linear-gradient(160deg,#1b2944,#304569_55%,#101827)]">
          <div className="pt-[22cqw] text-center text-white">
            <p className="text-[19cqw] leading-none font-light tracking-tight">
              {timeLabel}
            </p>
            <p className="mt-[2cqw] text-[4.5cqw]">
              {formatNotificationClockDate(currentTime)}
            </p>
          </div>

          <div className="mx-[4cqw] mt-[9cqw] rounded-[5.5cqw] bg-white/92 p-[3.5cqw] text-neutral-900 shadow-lg backdrop-blur-md dark:bg-neutral-900/92 dark:text-neutral-100">
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
                  <span className="text-[2.5cqw] whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    たった今
                  </span>
                </div>
                <p className="mt-[0.5cqw] line-clamp-3 text-[3.25cqw] leading-relaxed text-neutral-600 dark:text-neutral-300">
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
