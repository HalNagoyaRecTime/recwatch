import { useLocation, useNavigate } from "react-router";
import { Trash2 } from "lucide-react";

import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

type TeacherActionMenuProps = {
  disabled?: boolean;
  teacher: TeacherRow;
};

export function TeacherActionMenu({
  disabled,
  teacher,
}: TeacherActionMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ManagementRowActionMenu
      ariaLabel={`${teacher.displayName}の操作`}
      deleteDisabled
      deleteDanger={teacher.isLiveActive}
      deleteIcon={teacher.isLiveActive ? Trash2 : undefined}
      deleteLabel={
        teacher.isLiveActive
          ? "教官を無効化する（未接続）"
          : "教官を有効化する（未接続）"
      }
      disabled={disabled}
      editLabel="教官を編集する"
      onEdit={() =>
        navigate(teacherEditTarget(teacher.teacherId, location.search))
      }
    />
  );
}
