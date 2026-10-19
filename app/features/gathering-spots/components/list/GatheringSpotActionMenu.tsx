import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type GatheringSpotActionMenuProps = {
  disabled?: boolean;
  onDelete: (spot: GatheringSpot) => void;
  onEdit: (spot: GatheringSpot) => void;
  spot: GatheringSpot;
};

export function GatheringSpotActionMenu({
  disabled = false,
  onDelete,
  onEdit,
  spot,
}: GatheringSpotActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items: MenuItemType[] = [
    {
      icon: Pencil,
      id: "edit",
      label: "編集",
      onClick: () => {
        setIsOpen(false);
        onEdit(spot);
      },
      type: "action",
    },
    {
      icon: Trash2,
      id: "delete",
      label: "削除",
      danger: true,
      onClick: () => {
        setIsOpen(false);
        onDelete(spot);
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
      scrollable
      trigger={
        <Button
          aria-label={`${spot.name}のその他の操作`}
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
