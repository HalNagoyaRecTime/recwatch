import { Ellipsis, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type GatheringSpotActionMenuProps = {
  onEdit: (spot: GatheringSpot) => void;
  spot: GatheringSpot;
};

export function GatheringSpotActionMenu({
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
  ];

  return (
    <FloatingPanel
      content={<Menu items={items} />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${spot.name}のその他の操作`}
          icon={Ellipsis}
          iconOnly
          size="sm"
          variant="ghost"
        />
      }
    />
  );
}
