import type { ScheduleDraft } from "../model/schedule-draft";

type ScheduleNotificationPreviewProps = {
  draft: ScheduleDraft;
};

export function ScheduleNotificationPreview({
  draft,
}: ScheduleNotificationPreviewProps) {
  if (!draft.notificationEnabled) {
    return (
      <div className="rounded-lg border border-dashed border-[color:var(--border-2)] p-6 text-sm text-[color:var(--text-3)]">
        通知なしが選択されています
      </div>
    );
  }

  const scheduleName = draft.eventName.trim() || "イベント";
  const previewTime = draft.startTime || "9:00";

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-[color:var(--text-2)]">
        配信先イメージ（スマートフォン通知）
      </h2>
      <div className="relative h-[396px] w-full max-w-[188px] overflow-hidden rounded-[27px] border border-[color:var(--border-strong)] bg-white text-slate-950 shadow-lg">
        <div className="flex items-center justify-between px-4 pt-3 text-[11px] font-semibold">
          <span>{previewTime}</span>
          <span aria-hidden="true">▮▮ ◒ ▰</span>
        </div>
        <div className="pt-14 text-center">
          <div className="text-[31px] font-light">{previewTime}</div>
          <div className="mt-2 text-[10px]">2026年11月07日 金曜日</div>
        </div>
        <div className="mx-3 mt-10 rounded-xl bg-slate-200/95 px-3 py-2.5 shadow-sm">
          <div className="flex gap-2">
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-md bg-white" />
            <div className="min-w-0">
              <div className="text-[9px] font-semibold">rectime</div>
              <div className="mt-0.5 line-clamp-2 text-[8px] leading-[1.45]">
                {`${scheduleName}の開始時間が近づいています。指定された集合場所に集合してください。`}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-8 text-center text-[9px] text-slate-400">
          上にスワイプして開く
        </div>
      </div>
    </div>
  );
}
