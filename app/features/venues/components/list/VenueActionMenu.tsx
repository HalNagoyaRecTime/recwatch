import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { Venue } from "~/features/venues/model/venue";

type VenueActionMenuProps = {
  disabled?: boolean;
  onDelete: (venue: Venue) => void;
  onEdit: (venue: Venue) => void;
  venue: Venue;
};

export function VenueActionMenu({
  disabled = false,
  onDelete,
  onEdit,
  venue,
}: VenueActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items: MenuItemType[] = [
    {
      icon: Pencil,
      id: "edit",
      label: "編集",
      onClick: () => {
        setIsOpen(false);
        onEdit(venue);
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
        onDelete(venue);
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
          aria-label={`${venue.name}のその他の操作`}
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
