import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { TeacherActionMenu } from "~/features/teachers/components/TeacherActionMenu";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherTableProps = {
  items: readonly TeacherRow[];
};

export function TeacherTable({ items }: TeacherTableProps) {
  const columns: readonly DataTableColumn<TeacherRow>[] = [
    {
      header: "教官ID",
      id: "teacher-id",
      width: { type: "fixed", value: 120 },
      renderCell: (teacher) => teacher.teacherId,
    },
    {
      header: "教官名",
      id: "display-name",
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (teacher) => teacher.displayName,
    },
    {
      header: "担当クラス",
      id: "class-rooms",
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
      getRowKey={(teacher) => teacher.teacherId}
      items={items}
    />
  );
}
