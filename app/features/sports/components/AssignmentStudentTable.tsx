import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";

import type { AssignmentStudent } from "../model/competition-assignment";

type AssignmentStudentTableProps = {
  disabled: boolean;
  onToggle: (userId: number) => void;
  selectedUserIds: readonly number[];
  students: readonly AssignmentStudent[];
};

export function AssignmentStudentTable({
  disabled,
  onToggle,
  selectedUserIds,
  students,
}: AssignmentStudentTableProps) {
  const columns: readonly DataTableColumn<AssignmentStudent>[] = [
    {
      align: "center",
      header: "選択",
      id: "selection",
      width: { type: "fixed", value: 72 },
      renderCell: (student) => (
        <input
          aria-label={`${student.name}を選択`}
          checked={selectedUserIds.includes(student.userId)}
          className="accent-brand-primary size-4"
          disabled={disabled}
          onChange={() => onToggle(student.userId)}
          type="checkbox"
        />
      ),
    },
    {
      header: "学籍番号",
      id: "student-number",
      width: { type: "fluid", min: 130, grow: 1 },
      renderCell: (student) => student.studentNumber,
    },
    {
      header: "出席番号",
      id: "attendance-number",
      width: { type: "fixed", value: 110 },
      renderCell: (student) => student.attendanceNumber,
    },
    {
      header: "氏名",
      id: "name",
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (student) => (
        <span className="text-text-base font-semibold">{student.name}</span>
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="参加者候補の生徒一覧"
      columns={columns}
      emptyMessage="このクラスには参加者として選択できる生徒がいません"
      getRowKey={(student) => student.id}
      items={students}
    />
  );
}
