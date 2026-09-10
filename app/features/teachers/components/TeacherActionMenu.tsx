import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";
import type { TeacherRow } from "~/features/teachers/model/teacher";

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
  const [isOpen, setIsOpen] = useState(false);
  const statusLabel = teacher.isLiveActive
    ? "教官を無効化する（Backend対応待ち）"
    : "教官を有効化する（Backend対応待ち）";
  const items: MenuItemType[] = [
    {
      disabled,
      icon: Pencil,
      id: "edit",
      label: "教官を編集する",
      onClick: () => {
        setIsOpen(false);
        navigate(teacherEditTarget(teacher.teacherId, location.search));
      },
      type: "action",
    },
    {
      danger: teacher.isLiveActive,
      disabled: true,
      icon: teacher.isLiveActive ? Trash2 : undefined,
      id: "status",
      label: statusLabel,
      type: "action",
    },
  ];

  return (
    <FloatingPanel
      content={<Menu items={items} />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${teacher.displayName}の操作`}
          disabled={disabled}
          icon={Ellipsis}
          iconOnly
          size="sm"
          variant="ghost"
        />
      }
    />
  );
}
