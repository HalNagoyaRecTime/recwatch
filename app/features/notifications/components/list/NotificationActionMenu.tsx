import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { NotificationListItem } from "~/features/notifications/model/notification-list-item";

type NotificationActionMenuProps = {
  notification: NotificationListItem;
  onDelete?: (notification: NotificationListItem) => void;
};

export function NotificationActionMenu({
  notification,
  onDelete,
}: NotificationActionMenuProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const closeAnd = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const items: MenuItemType[] = [
    {
      icon: Eye,
      id: "details",
      label: "通知詳細",
      onClick: () =>
        closeAnd(() => navigate(`/notifications/${notification.id}`)),
      type: "action",
    },
    {
      icon: Pencil,
      id: "edit",
      label: "通知を編集",
      onClick: () =>
        closeAnd(() => navigate(`/notifications/${notification.id}/edit`)),
      type: "action",
    },
    { id: "actions-divider", type: "divider" },
    {
      danger: true,
      icon: Trash2,
      id: "delete",
      label: "通知を削除",
      onClick: () => closeAnd(() => onDelete?.(notification)),
      type: "action",
    },
  ];

  return (
    <FloatingPanel
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${notification.title}のその他の操作`}
          icon={Ellipsis}
          iconOnly
          size="sm"
          variant="ghost"
        />
      }
      content={<Menu items={items} />}
    />
  );
}
