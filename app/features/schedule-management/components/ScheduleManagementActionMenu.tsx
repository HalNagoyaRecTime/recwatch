import { Ellipsis, Eye, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";

import type { ManagedSchedule } from "../model/schedule";

type ScheduleManagementActionMenuProps = {
  onCancelNotification: (schedule: ManagedSchedule) => void;
  onShowDetail: (schedule: ManagedSchedule) => void;
  schedule: ManagedSchedule;
};

export function ScheduleManagementActionMenu({
  onCancelNotification,
  onShowDetail,
  schedule,
}: ScheduleManagementActionMenuProps) {
  const label = schedule.relatedEventName || schedule.startTime;
  const items: MenuItemType[] = [
    {
      icon: Eye,
      id: "detail",
      label: "詳細",
      onClick: () => onShowDetail(schedule),
      type: "action",
    },
  ];

  if (schedule.notificationEnabled) {
    items.push({
      danger: true,
      icon: Trash2,
      id: "cancel-notification",
      label: "通知を削除",
      onClick: () => onCancelNotification(schedule),
      type: "action",
    });
  }

  return (
    <FloatingPanel
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${label}の操作`}
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
