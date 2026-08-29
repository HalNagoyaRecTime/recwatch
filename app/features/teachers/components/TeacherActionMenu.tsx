import { useLocation, useNavigate } from "react-router";

import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ManagementRowActionMenu } from "~/features/user-management/components/ManagementRowActionMenu";

type TeacherActionMenuProps = {
  disabled?: boolean;
  onDelete: (teacher: TeacherRow) => void;
  teacher: TeacherRow;
};

export function TeacherActionMenu({
  disabled,
  onDelete,
  teacher,
}: TeacherActionMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ManagementRowActionMenu
      ariaLabel={`${teacher.displayName}の操作`}
      disabled={disabled}
      onDelete={() => onDelete(teacher)}
      onEdit={() =>
        navigate(teacherEditTarget(teacher.teacherId, location.search))
      }
    />
  );
}
