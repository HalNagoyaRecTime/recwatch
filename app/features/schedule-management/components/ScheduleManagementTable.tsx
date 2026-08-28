import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

import type { ManagedSchedule } from "../model/schedule";
import { ScheduleManagementActionMenu } from "./ScheduleManagementActionMenu";
import { SchedulePublicationLabel } from "./SchedulePublicationLabel";

type ScheduleManagementTableProps = {
  schedules: ManagedSchedule[];
  onShowDetail: (schedule: ManagedSchedule) => void;
  onCancelNotification: (schedule: ManagedSchedule) => void;
};

function fallback(value: string | null) {
  return value || "—";
}

export function ScheduleManagementTable({
  schedules,
  onShowDetail,
  onCancelNotification,
}: ScheduleManagementTableProps) {
  const columns: readonly DataTableColumn<ManagedSchedule>[] = [
    {
      header: "イベント名",
      id: "event-name",
      width: { type: "fluid", min: 200, grow: 2 },
      renderCell: (schedule) => (
        <button
          className="text-text-base hover:text-brand-primary text-left font-semibold"
          onClick={() => onShowDetail(schedule)}
          type="button"
        >
          {fallback(schedule.relatedEventName)}
        </button>
      ),
    },
    {
      header: "開催時間",
      id: "time",
      width: { type: "fixed", value: 150 },
      renderCell: (schedule) => `${schedule.startTime}〜${schedule.endTime}`,
    },
    {
      header: "開催場所",
      id: "venue",
      width: { type: "fluid", min: 150, grow: 1 },
      renderCell: (schedule) => fallback(schedule.venueName),
    },
    {
      header: "備考",
      id: "notes",
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (schedule) => (
        <span title={schedule.notes ?? undefined}>
          {fallback(schedule.notes)}
        </span>
      ),
    },
    {
      edge: "right",
      header: "予約投稿",
      id: "publication",
      width: { type: "fixed", value: 140 },
      renderCell: (schedule) => (
        <SchedulePublicationLabel publication={schedule.publication} />
      ),
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (schedule) => (
        <ScheduleManagementActionMenu
          onCancelNotification={onCancelNotification}
          onShowDetail={onShowDetail}
          schedule={schedule}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="イベント日程一覧"
      columns={columns}
      getRowKey={(schedule) => schedule.id}
      items={schedules}
    />
  );
}
