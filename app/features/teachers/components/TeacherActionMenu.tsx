import { Ellipsis, Pencil, UserRoundX } from "lucide-react";
import { useLocation, useNavigate, useRevalidator } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";
import { TeacherApi } from "~/features/teachers/api";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherActionMenuProps = {
  teacher: TeacherRow;
};

export function TeacherActionMenu({ teacher }: TeacherActionMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const revalidator = useRevalidator();

  async function handleDeactivate() {
    if (
      !window.confirm(
        `${teacher.displayName}を無効化します。履歴は保持されます。よろしいですか？`
      )
    ) {
      return;
    }

    try {
      await TeacherApi.deleteTeacher(teacher.teacherId);
      revalidator.revalidate();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "教官の無効化に失敗しました。"
      );
    }
  }

  return (
    <FloatingPanel
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${teacher.displayName}の操作`}
          icon={Ellipsis}
          iconOnly
          size="sm"
          variant="ghost"
        />
      }
      content={
        <Menu
          items={[
            {
              icon: Pencil,
              id: "edit",
              label: "教官情報を編集",
              onClick: () =>
                navigate(teacherEditTarget(teacher.teacherId, location.search)),
              type: "action",
            },
            { id: "divider", type: "divider" },
            {
              danger: true,
              icon: UserRoundX,
              id: "deactivate",
              label: "無効化",
              onClick: () => void handleDeactivate(),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
