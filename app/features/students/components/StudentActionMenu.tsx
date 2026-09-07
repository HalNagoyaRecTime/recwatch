import { BadgeMinus, Ellipsis, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { StudentRow } from "~/features/students/model/student";

type StudentActionMenuProps = {
  disabled?: boolean;
  onEdit: () => void;
  student: StudentRow;
};

/** Student固有の操作項目。状態変更APIが接続されるまで項目は無効化します。 */
export function StudentActionMenu({
  disabled = false,
  onEdit,
  student,
}: StudentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const items: MenuItemType[] = [
    {
      disabled,
      icon: Pencil,
      id: "edit",
      label: "学生を編集する",
      onClick: () => {
        setIsOpen(false);
        onEdit();
      },
      type: "action",
    },
    {
      disabled: true,
      icon: student.isStaff ? BadgeMinus : UserPlus,
      id: "staff",
      label: student.isStaff
        ? "staffを解除する（API接続待ち）"
        : "staff付与（API接続待ち）",
      type: "action",
    },
    {
      danger: student.isLiveActive,
      disabled: true,
      icon: student.isLiveActive ? Trash2 : undefined,
      id: "active",
      label: student.isLiveActive
        ? "学生を無効化する（未接続）"
        : "学生を有効化する（未接続）",
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
          aria-label={`${student.displayName}の操作`}
          data-user-id={student.userId}
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
