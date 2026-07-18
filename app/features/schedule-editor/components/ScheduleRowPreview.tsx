import { PencilIcon, Trash2Icon } from "lucide-react";

import type { ScheduleDraft } from "../model/schedule-draft";
import { scheduleTypeLabels } from "../model/schedule-draft";
import type { ScheduleFormOptions } from "../model/schedule-option";

type ScheduleRowPreviewProps = {
  draft: ScheduleDraft;
  options: ScheduleFormOptions;
};

function optionName(
  options: ScheduleFormOptions[keyof ScheduleFormOptions],
  id: string
) {
  return options.find((option) => option.id === id)?.name || "-";
}

export function ScheduleRowPreview({
  draft,
  options,
}: ScheduleRowPreviewProps) {
  const time =
    draft.startTime && draft.endTime
      ? `${draft.startTime}-${draft.endTime}`
      : "-";

  return (
    <div>
      <h2 className="mb-2 text-xs text-[color:var(--text-3)]">
        一覧表示プレビュー
      </h2>
      <div className="overflow-x-auto rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)]">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead className="bg-[color:var(--surface-2)] text-[color:var(--text-2)]">
            <tr>
              <th className="px-3 py-2.5 font-medium">種別</th>
              <th className="px-3 py-2.5 font-medium">開催時間</th>
              <th className="px-3 py-2.5 font-medium">開催場所</th>
              <th className="px-3 py-2.5 font-medium">集合場所</th>
              <th className="px-3 py-2.5 font-medium">関連競技</th>
              <th className="px-3 py-2.5 font-medium">備考</th>
              <th className="px-3 py-2.5 font-medium">予約投稿</th>
              <th className="px-3 py-2.5 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[color:var(--border-1)]">
              <td className="px-3 py-3 whitespace-nowrap">
                {draft.type ? scheduleTypeLabels[draft.type] : "-"}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">{time}</td>
              <td className="px-3 py-3 whitespace-nowrap">
                {optionName(options.venues, draft.venueId)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {optionName(options.gatheringSpots, draft.gatheringSpotId)}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {optionName(options.events, draft.eventId)}
              </td>
              <td className="max-w-32 truncate px-3 py-3">
                {draft.notes || "-"}
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                {draft.notificationEnabled ? "通知あり" : "通知なし"}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-2 text-[color:var(--text-3)]">
                  <PencilIcon size={14} aria-label="編集イメージ" />
                  <Trash2Icon size={14} aria-label="削除イメージ" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
