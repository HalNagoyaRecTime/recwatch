import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { TeacherActionMenu } from "~/features/teachers/components/TeacherActionMenu";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";

type TeacherTableProps = {
  footer?: ReactNode;
  items: readonly TeacherRow[];
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function TeacherTable({
  footer,
  items,
  onSortChange,
  sort,
}: TeacherTableProps) {
  const location = useLocation();
  const columns: readonly DataTableColumn<TeacherRow>[] = [
    {
      header: "ID",
      id: "teacher-id",
      sortable: true,
      width: { type: "fixed", value: 120 },
      renderCell: (teacher) => (
        <Link
          aria-label={`教官ID ${teacher.teacherId}を編集`}
          className="text-brand-primary hover:underline"
          to={teacherEditTarget(teacher.teacherId, location.search)}
        >
          {teacher.teacherId}
        </Link>
      ),
    },
    {
      header: "教官名",
      id: "display-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (teacher) => teacher.displayName,
    },
    {
      align: "center",
      header: "staff",
      id: "staff",
      sortable: true,
      width: { type: "fixed", value: 150 },
      renderCell: (teacher) => (
        <span>{teacher.isStaff ? "staff" : "staffではない"}</span>
      ),
    },
    {
      align: "center",
      header: "有効",
      id: "active",
      sortable: true,
      width: { type: "fixed", value: 150 },
      renderCell: (teacher) => (
        <span>{teacher.isLiveActive ? "有効" : "無効"}</span>
      ),
    },
    {
      header: "クラスコード",
      id: "class-code",
      sortable: true,
      width: { type: "fluid", min: 220, grow: 2 },
      renderCell: (teacher) =>
        teacher.classRooms.length > 0
          ? teacher.classRooms
              .map((classRoom) => classRoom.classCode)
              .join("、")
          : "-",
    },
    {
      header: "クラス名",
      id: "class-name",
      sortable: true,
      width: { type: "fluid", min: 220, grow: 2 },
      renderCell: (teacher) =>
        teacher.classRooms.length > 0
          ? teacher.classRooms
              .map((classRoom) => classRoom.className)
              .join("、")
          : "-",
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (teacher) => <TeacherActionMenu teacher={teacher} />,
    },
  ];

  return (
    <DataTable
      ariaLabel="教官一覧"
      columns={columns}
      emptyMessage="該当する教官が見つかりません。"
      footer={footer}
      getRowKey={(teacher) => teacher.teacherId}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
