import { Ellipsis } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";

type ManagementRowActionMenuProps = {
  ariaLabel: string;
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export function ManagementRowActionMenu({
  ariaLabel,
  disabled = false,
  onDelete,
  onEdit,
}: ManagementRowActionMenuProps) {
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
