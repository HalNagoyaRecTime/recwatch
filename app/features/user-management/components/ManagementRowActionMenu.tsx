import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import type { ElementType } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";

type ManagementRowActionMenuProps = {
  ariaLabel: string;
  disabled?: boolean;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  deleteDanger?: boolean;
  deleteIcon?: ElementType;
  deleteLabel?: string;
  editLabel?: string;
  onEdit: () => void;
};

export function ManagementRowActionMenu({
  ariaLabel,
  disabled = false,
  onDelete,
  deleteDisabled = false,
  deleteDanger = true,
  deleteIcon = Trash2,
  deleteLabel,
  editLabel = "編集",
  onEdit,
}: ManagementRowActionMenuProps) {
  const resolvedDeleteLabel = deleteLabel ?? (onDelete ? "削除" : undefined);
  const items = [
    {
      disabled,
      id: "edit",
      icon: Pencil,
      label: editLabel,
      onClick: onEdit,
      type: "action" as const,
    },
    ...(onDelete || resolvedDeleteLabel
      ? [
          {
            danger: deleteDanger,
            disabled: disabled || deleteDisabled,
            id: "delete",
            icon: deleteIcon,
            label: resolvedDeleteLabel ?? "削除",
            onClick: onDelete,
            type: "action" as const,
          },
        ]
      : []),
  ];

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
      content={<Menu items={items} />}
    />
  );
}
