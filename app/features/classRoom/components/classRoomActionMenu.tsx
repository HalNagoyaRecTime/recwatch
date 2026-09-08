import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { ClassRoom } from "~/features/classRoom/model/classRoom";

type ClassRoomActionMenuProps = {
  classRoom: ClassRoom;
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export function ClassRoomActionMenu({
  classRoom,
  disabled = false,
  onDelete,
  onEdit,
}: ClassRoomActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const items: MenuItemType[] = [
    {
      disabled,
      icon: Pencil,
      id: "edit",
      label: "クラスを編集する",
      onClick: () => {
        setIsOpen(false);
        onEdit();
      },
      type: "action",
    },
    {
      danger: true,
      disabled,
      icon: Trash2,
      id: "delete",
      label: "クラスを削除する",
      onClick: () => {
        setIsOpen(false);
        onDelete();
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
          aria-label={`${classRoom.className}の操作`}
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
