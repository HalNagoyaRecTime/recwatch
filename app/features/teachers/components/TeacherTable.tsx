import { DataTable } from "~/components/ui/data-table/DataTable";
import type { DataTableColumn } from "~/components/ui/data-table/data-table-types";
import { TeacherActionMenu } from "~/features/teachers/components/TeacherActionMenu";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherTableProps = {
  items: readonly TeacherRow[];
  onSortChange: (columnId: string) => void;
  sort: { columnId: string; direction: "asc" | "desc" };
};

export function TeacherTable({ items, onSortChange, sort }: TeacherTableProps) {
  const columns: readonly DataTableColumn<TeacherRow>[] = [
    {
      header: "ID",
      id: "teacher-id",
      sortable: true,
      width: { type: "fixed", value: 72 },
      renderCell: (teacher) => String(teacher.teacherId),
    },
    {
      header: "教官名",
      id: "display-name",
      sortable: true,
      width: { type: "fluid", min: 110, grow: 1, resizable: true },
      renderCell: (teacher) => teacher.displayName,
    },
    {
      header: "担当クラス",
      id: "class-rooms",
      sortable: true,
      width: { type: "fluid", min: 220, grow: 1, resizable: true },
      renderCell: (teacher) =>
        teacher.classRooms.map((classRoom) => classRoom.className).join("、") ||
        "—",
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
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
