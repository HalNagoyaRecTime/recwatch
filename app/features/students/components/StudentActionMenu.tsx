import { BadgeMinus, Ellipsis, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { StudentRow } from "~/features/students/model/student";

type StudentActionMenuProps = {
  disabled?: boolean;
  onChangeActive: (isLiveActive: boolean) => void | Promise<void>;
  onChangeStaff: (isStaff: boolean) => void | Promise<void>;
  onEdit: () => void;
  student: StudentRow;
};

export function StudentActionMenu({
  disabled = false,
  onChangeActive,
  onChangeStaff,
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
      disabled,
      icon: student.isStaff ? BadgeMinus : UserPlus,
      id: "staff",
      label: student.isStaff ? "staffを解除する" : "staffを付与する",
      onClick: () => {
        if (
          !window.confirm(
            `「${student.displayName}」のstaffを${student.isStaff ? "解除" : "付与"}します。よろしいですか？`
          )
        ) {
          return;
        }
        setIsOpen(false);
        void onChangeStaff(!student.isStaff);
      },
      type: "action",
    },
    {
      danger: student.isLiveActive,
      disabled,
      icon: student.isLiveActive ? Trash2 : undefined,
      id: "active",
      label: student.isLiveActive ? "学生を無効化する" : "学生を有効化する",
      onClick: () => {
        const action = student.isLiveActive ? "無効化" : "有効化";
        if (
          !window.confirm(
            `「${student.displayName}」を${action}します。よろしいですか？`
          )
        ) {
          return;
        }
        setIsOpen(false);
        void onChangeActive(!student.isLiveActive);
      },
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
