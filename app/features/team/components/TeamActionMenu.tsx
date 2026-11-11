import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import {
  teamDetailTarget,
  teamEditTarget,
} from "~/features/team/application/team-navigation";
import type { Team } from "~/features/team/model/team";

export function TeamActionMenu({
  onDeleteRequest,
  search,
  team,
}: {
  onDeleteRequest: (team: Team) => void;
  search: string;
  team: Team;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeAnd = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <FloatingPanel
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${team.name}の操作`}
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
              icon: Eye,
              id: "detail",
              label: "詳細",
              onClick: () =>
                closeAnd(() =>
                  navigate(teamDetailTarget(team.id, search || location.search))
                ),
              type: "action",
            },
            {
              icon: Pencil,
              id: "edit",
              label: "編集",
              onClick: () =>
                closeAnd(() =>
                  navigate(teamEditTarget(team.id, search || location.search))
                ),
              type: "action",
            },
            { id: "actions-divider", type: "divider" },
            {
              danger: true,
              icon: Trash2,
              id: "delete",
              label: "削除",
              onClick: () => closeAnd(() => onDeleteRequest(team)),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
