import type { ReactNode } from "react";

import { DataTable } from "~/components/ui/data-table/DataTable";
import type {
  DataTableColumn,
  DataTableSort,
} from "~/components/ui/data-table/data-table-types";
import { ClassRoomActionMenu } from "~/features/classRoom/components/classRoomActionMenu";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";

type ClassRoomTableProps = {
  emptyMessage?: string;
  footer?: ReactNode;
  isMutating?: boolean;
  items: readonly ClassRoomData[];
  onDelete?: (classRoom: ClassRoomData) => void;
  onEdit?: (classRoom: ClassRoomData) => void;
  onSortChange?: (columnId: string) => void;
  sort?: DataTableSort;
};

export function ClassRoomTable({
  emptyMessage,
  footer,
  isMutating = false,
  items,
  onDelete,
  onEdit,
  onSortChange,
  sort,
}: ClassRoomTableProps) {
  const columns: readonly DataTableColumn<ClassRoomData>[] = [
    {
      header: "ID",
      id: "class-room-id",
      sortable: true,
      width: { type: "fixed", value: 100 },
      renderCell: (classRoom) => classRoom.classRoomId,
    },
    {
      header: "クラスコード",
      id: "class-room-code",
      sortable: true,
      width: { type: "fluid", min: 140, grow: 1 },
      renderCell: (classRoom) => classRoom.classCode,
    },
    {
      header: "クラス名",
      id: "class-room-name",
      sortable: true,
      width: { type: "fluid", min: 180, grow: 2 },
      renderCell: (classRoom) => classRoom.className,
    },
    {
      header: "担当教官",
      id: "teacher-name",
      sortable: true,
      width: { type: "fluid", min: 160, grow: 1 },
      renderCell: (classRoom) => classRoom.teacher?.displayName ?? "未設定",
    },
    {
      align: "start",
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
        <ClassRoomActionMenu
          classRoom={classRoom}
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
      emptyMessage={emptyMessage ?? "該当するクラスが見つかりません。"}
      footer={footer}
      getRowKey={(classRoom) => classRoom.classRoomId}
      items={items}
      onSortChange={onSortChange}
      sort={sort}
    />
  );
}
