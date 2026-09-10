import type { ReactNode } from "react";

import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import { StudentActionMenu } from "~/features/students/components/StudentActionMenu";
import type { StudentRow } from "~/features/students/model/student";

type StudentTableProps = {
  emptyMessage?: string;
  footer?: ReactNode;
  isMutating?: boolean;
  items: readonly StudentRow[];
  onChangeActive: (student: StudentRow, isLiveActive: boolean) => void;
  onChangeStaff: (student: StudentRow, isStaff: boolean) => void;
  onEdit: (student: StudentRow) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function StudentTable({
  emptyMessage,
  footer,
  isMutating = false,
  items,
  onChangeActive,
  onChangeStaff,
  onEdit,
  onSortChange,
  sort,
}: StudentTableProps) {
  const columns: readonly DataTableColumn<StudentRow>[] = [
    {
      header: "ID",
      id: "student-id",
      sortable: true,
      width: { type: "fixed", value: 100 },
      renderCell: (student) => student.studentId,
    },
    {
      header: "学籍番号",
      id: "student-number",
      sortable: true,
      width: { type: "fluid", min: 150, grow: 1 },
      renderCell: (student) => student.studentIdNumber,
    },
    {
      header: "氏名",
      id: "display-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (student) => student.displayName,
    },
    {
      align: "center",
      header: "staff",
      id: "staff",
      sortable: true,
      width: { type: "fluid", min: 120, grow: 0.6 },
      renderCell: (student) => (
        <span>{student.isStaff ? "staff" : "staffではない"}</span>
      ),
    },
    {
      align: "center",
      header: "有効",
      id: "active",
      sortable: true,
      width: { type: "fluid", min: 120, grow: 0.6 },
      renderCell: (student) => (
        <span>{student.isLiveActive ? "有効" : "無効"}</span>
      ),
    },
    {
      header: "クラスコード",
      id: "class-code",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (student) => student.classRoom.classCode,
    },
    {
      header: "クラス名",
      id: "class-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (student) => student.classRoom.className,
    },
    {
      align: "end",
      edge: "right",
      header: "出席番号",
      id: "attendance-number",
      sortable: true,
      width: { type: "fixed", value: 110 },
      renderCell: (student) => student.attendanceNumber,
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (student) => (
        <StudentActionMenu
          disabled={isMutating}
          onChangeActive={(isLiveActive) =>
            onChangeActive(student, isLiveActive)
          }
          onChangeStaff={(isStaff) => onChangeStaff(student, isStaff)}
          onEdit={() => onEdit(student)}
          student={student}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="学生一覧"
      columns={columns}
      emptyMessage={emptyMessage ?? "該当する学生が見つかりません。"}
      footer={footer}
      getRowKey={(student) => student.studentId}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
