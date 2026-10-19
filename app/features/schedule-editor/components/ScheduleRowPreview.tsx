import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

import type { ScheduleDraft } from "../model/schedule-draft";

type ScheduleRowPreviewProps = {
  draft: ScheduleDraft;
};

export function ScheduleRowPreview({ draft }: ScheduleRowPreviewProps) {
  const columns: readonly DataTableColumn<ScheduleDraft>[] = [
    {
      header: "イベント名",
      id: "event-name",
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (item) => item.eventName || "—",
    },
    {
      header: "開催時間",
      id: "time",
      width: { type: "fixed", value: 150 },
      renderCell: (item) =>
        item.startTime && item.endTime
          ? `${item.startTime}〜${item.endTime}`
          : "—",
    },
    {
      header: "開催場所",
      id: "venue",
      width: { type: "fluid", min: 150, grow: 1 },
      renderCell: (item) => item.venue || "—",
    },
    {
      header: "備考",
      id: "notes",
      width: { type: "fluid", min: 160, grow: 1 },
      renderCell: (item) => item.notes || "—",
    },
    {
      edge: "right",
      header: "予約投稿",
      id: "notification",
      width: { type: "fixed", value: 130 },
      renderCell: (item) =>
        item.notificationEnabled ? "通知あり" : "通知なし",
    },
  ];

  return (
    <section aria-labelledby="schedule-row-preview-heading">
      <h2
        className="text-text-muted mb-2 text-xs"
        id="schedule-row-preview-heading"
      >
        一覧表示プレビュー
      </h2>
      <DataTable
        ariaLabel="イベント一覧表示プレビュー"
        columns={columns}
        getRowKey={() => "preview"}
        items={[draft]}
      />
    </section>
  );
}
