import { MobileDeviceFrame } from "~/components/ui/layout/MobileDeviceFrame";
import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

type NotificationMobilePreviewProps = {
  draft: NotificationDraft;
};

export function NotificationMobilePreview({
  draft,
}: NotificationMobilePreviewProps) {
  return (
    <div className="aspect-9/20 w-[min(17rem,calc(100cqw-2.25rem))] max-w-full shrink-0">
      <MobileDeviceFrame>
        <div className="relative h-full overflow-hidden bg-[linear-gradient(160deg,var(--brand-1),var(--brand-2)_55%,var(--surface-brand-soft))]">
          <div className="pt-[22cqw] text-center text-white">
            <p className="text-[19cqw] leading-none font-light tracking-tight">
              9:30
            </p>
            <p className="mt-[2cqw] text-[4.5cqw]">7月14日 火曜日</p>
          </div>

          <div className="bg-surface-base text-text-base shadow-soft mx-[4cqw] mt-[9cqw] rounded-[5.5cqw] p-[3.5cqw] backdrop-blur-md">
            <div className="flex items-start gap-[3cqw]">
              <span className="bg-surface-base shadow-soft relative flex size-[9cqw] shrink-0 items-center justify-center rounded-[2.5cqw]">
                <img
                  src="/recwatch-logo.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-auto w-[7cqw]"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[2cqw]">
                  <p className="text-[3.5cqw] font-semibold">recwatch</p>
                  <span className="text-text-subtle text-[2.5cqw]">
                    たった今
                  </span>
                </div>
                <p className="mt-[1cqw] truncate text-[4cqw] font-semibold">
                  {draft.title || "通知の件名が表示されます"}
                </p>
                <p className="text-text-muted mt-[0.5cqw] line-clamp-3 text-[3.25cqw] leading-relaxed">
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
