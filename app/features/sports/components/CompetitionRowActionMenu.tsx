import { Ellipsis } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";

type CompetitionRowActionMenuProps = {
  ariaLabel: string;
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpenGatherings: () => void;
};

/**
 * イベント一覧の行操作。共通の編集・削除に加えて集合設定を開く項目を持つ。
 */
export function CompetitionRowActionMenu({
  ariaLabel,
  disabled = false,
  onDelete,
  onEdit,
  onOpenGatherings,
}: CompetitionRowActionMenuProps) {
  return (
    <FloatingPanel
      placement="bottom-end"
      trigger={
        <Button
          aria-label={ariaLabel}
          disabled={disabled}
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
              disabled,
              id: "edit",
              label: "編集",
              onClick: onEdit,
              type: "action",
            },
            {
              disabled,
              id: "gatherings",
              label: "集合設定",
              onClick: onOpenGatherings,
              type: "action",
            },
            {
              danger: true,
              disabled,
              id: "delete",
              label: "削除",
              onClick: onDelete,
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
