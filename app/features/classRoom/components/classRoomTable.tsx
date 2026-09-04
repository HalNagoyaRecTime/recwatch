import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

type ClassRoomTableProps = {
  classRooms: readonly ClassRoomData[];
  isMutating?: boolean;
  onDelete?: (classRoom: ClassRoomData) => void;
  onEdit?: (classRoom: ClassRoomData) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function ClassRoomTable({
  classRooms,
  isMutating = false,
  onDelete,
  onEdit,
  onSortChange,
  sort,
}: ClassRoomTableProps) {
  const columns: readonly DataTableColumn<ClassRoomData>[] = [
    {
      header: "クラスID",
      id: "class-room-id",
      sortable: true,
      width: { type: "fixed", value: 110 },
      renderCell: (classRoom) => classRoom.classRoomId,
    },
    {
      header: "クラス記号",
      id: "class-room-code",
      sortable: true,
      width: { type: "fluid", min: 140, grow: 1 },
      renderCell: (classRoom) => classRoom.classRoomCode,
    },
    {
      header: "クラス名",
      id: "class-room-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (classRoom) => classRoom.classRoomName,
    },
    {
      header: "担当教官",
      id: "teacher-name",
      sortable: true,
      width: { type: "fluid", min: 160, grow: 1 },
      renderCell: (classRoom) => classRoom.teacherName ?? "未設定",
    },
    {
      align: "end",
      edge: "right",
      header: "学生数",
      id: "student-count",
      sortable: true,
      width: { type: "fixed", value: 100 },
      renderCell: (classRoom) => `${classRoom.studentCount}名`,
    },
    {
      align: "center",
      edge: "end",
      header: "",
      id: "actions",
      width: { type: "fixed", value: 64 },
      renderCell: (classRoom) => (
        <ManagementRowActionMenu
          ariaLabel={`${classRoom.classRoomName}の操作`}
          disabled={isMutating}
          onDelete={() => onDelete?.(classRoom)}
          onEdit={() => onEdit?.(classRoom)}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="クラス一覧"
      columns={columns}
      emptyMessage="該当するクラスが見つかりません。"
      getRowKey={(classRoom) => classRoom.classRoomId}
      items={classRooms}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
