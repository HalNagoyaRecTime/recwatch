import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

import type { ParticipantAssignment } from "../model/participant-assignment";

type ParticipantAssignmentTableProps = {
  assignments: readonly ParticipantAssignment[];
  emptyMessage: string;
  isMutating?: boolean;
  onDelete: (assignment: ParticipantAssignment) => void;
  onEdit: (assignment: ParticipantAssignment) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

function classLabel(assignment: ParticipantAssignment) {
  return assignment.classNames.join("、") || "クラス未設定";
}

function memberLabel(assignment: ParticipantAssignment) {
  return assignment.memberNames.join("、") || "未設定";
}

export function ParticipantAssignmentTable({
  assignments,
  emptyMessage,
  isMutating = false,
  onDelete,
  onEdit,
  onSortChange,
  sort,
}: ParticipantAssignmentTableProps) {
  const columns: readonly DataTableColumn<ParticipantAssignment>[] = [
    {
      header: "イベント",
      id: "event-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (assignment) => (
        <span className="text-text-base font-semibold">
          {assignment.eventName}
        </span>
      ),
    },
    {
      header: "クラス",
      id: "class-room",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: classLabel,
    },
    {
      header: "時間",
      id: "time",
      sortable: true,
      width: { type: "fixed", value: 160 },
      renderCell: (assignment) => assignment.eventTime,
    },
    {
      edge: "right",
      header: "参加者",
      id: "members",
      sortable: true,
      width: { type: "fixed", value: 260 },
      renderCell: (assignment) => (
        <span className="text-text-muted text-xs">
          {memberLabel(assignment)}
        </span>
      ),
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (assignment) => (
        <ManagementRowActionMenu
          ariaLabel={`${assignment.eventName}の操作`}
          disabled={isMutating}
          onDelete={() => onDelete(assignment)}
          onEdit={() => onEdit(assignment)}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="出場メンバー一覧"
      columns={columns}
      emptyMessage={emptyMessage}
      getRowKey={(assignment) => assignment.gatheringId}
      items={assignments}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
