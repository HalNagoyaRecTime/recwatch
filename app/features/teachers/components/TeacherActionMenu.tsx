import { Ellipsis, Pencil, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherActionMenuProps = {
  disabled?: boolean;
  onChangeActive: () => void | Promise<void>;
  onChangeStaff: () => void | Promise<void>;
  onClearError: () => void;
  onEdit: () => void;
  teacher: TeacherRow;
};

export function TeacherActionMenu({
  disabled,
  onChangeActive,
  onChangeStaff,
  onClearError,
  onEdit,
  teacher,
}: TeacherActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actionDisabled = disabled ?? false;
  const items: MenuItemType[] = [
    {
      disabled: actionDisabled,
      icon: Pencil,
      id: "edit",
      label: "教官を編集する",
      onClick: () => {
        setIsOpen(false);
        onEdit();
      },
      type: "action",
    },
    {
      danger: teacher.isLiveActive,
      disabled: actionDisabled,
      icon: teacher.isLiveActive ? ShieldOff : ShieldCheck,
      id: "active",
      label: teacher.isLiveActive ? "教官を無効化する" : "教官を有効化する",
      onClick: () => {
        setIsOpen(false);
        void onChangeActive();
      },
      type: "action",
    },
    {
      disabled: actionDisabled,
      icon: teacher.isStaff ? ShieldOff : ShieldCheck,
      id: "staff",
      label: teacher.isStaff ? "staff権限を解除する" : "staff権限を付与する",
      onClick: () => {
        setIsOpen(false);
        void onChangeStaff();
      },
      type: "action",
    },
  ];

  return (
    <FloatingPanel
      content={
        <div>
          <Menu items={items} />
        </div>
      }
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) onClearError();
      }}
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
