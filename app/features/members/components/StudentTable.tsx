import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import type { StudentDTO } from "~/features/members/api";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

type StudentTableProps = {
  emptyMessage?: string;
  isMutating?: boolean;
  items: readonly StudentDTO[];
  onDelete: (student: StudentDTO) => void;
  onEdit: (student: StudentDTO) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function StudentTable({
  emptyMessage,
  isMutating = false,
  items,
  onDelete,
  onEdit,
  onSortChange,
  sort,
}: StudentTableProps) {
  const columns: readonly DataTableColumn<StudentDTO>[] = [
    {
      header: "学生ID",
      id: "student-id",
      sortable: true,
      width: { type: "fixed", value: 100 },
      renderCell: (student) => student.student_id,
    },
    {
      header: "学籍番号",
      id: "student-number",
      sortable: true,
      width: { type: "fluid", min: 150, grow: 1 },
      renderCell: (student) => student.student_id_number,
    },
    {
      header: "氏名",
      id: "display-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (student) => student.display_name,
    },
    {
      header: "クラス",
      id: "class-room",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 1 },
      renderCell: (student) => student.class_room_name,
    },
    {
      align: "end",
      edge: "right",
      header: "出席番号",
      id: "attendance-number",
      sortable: true,
      width: { type: "fixed", value: 110 },
      renderCell: (student) => student.attendance_number,
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (student) => (
        <ManagementRowActionMenu
          ariaLabel={`${student.display_name}の操作`}
          disabled={isMutating}
          onDelete={() => onDelete(student)}
          onEdit={() => onEdit(student)}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="学生一覧"
      columns={columns}
      emptyMessage={emptyMessage ?? "該当する学生が見つかりません。"}
      getRowKey={(student) => student.student_id}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
