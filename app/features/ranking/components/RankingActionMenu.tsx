import { Ellipsis } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { rankingEditTarget } from "~/features/ranking/application/ranking-navigation";
import type { Ranking } from "~/features/ranking/model/ranking";

export function RankingActionMenu({ ranking }: { ranking: Ranking }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <FloatingPanel
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${ranking.teamName}の操作`}
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
              id: "edit",
              label: "得点編集",
              onClick: () =>
                navigate(rankingEditTarget(ranking.rank, location.search)),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
