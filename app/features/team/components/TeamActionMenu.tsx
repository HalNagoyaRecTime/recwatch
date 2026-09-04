import { Ellipsis } from "lucide-react";
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
  search,
  team,
}: {
  search: string;
  team: Team;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <FloatingPanel
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
              id: "detail",
              label: "詳細",
              onClick: () =>
                navigate(teamDetailTarget(team.id, search || location.search)),
              type: "action",
            },
            {
              id: "edit",
              label: "編集",
              onClick: () =>
                navigate(teamEditTarget(team.id, search || location.search)),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
