import { Ellipsis, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherActionMenuProps = {
  teacher: TeacherRow;
};

export function TeacherActionMenu({ teacher }: TeacherActionMenuProps) {
  const navigate = useNavigate();

  return (
    <FloatingPanel
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${teacher.displayName}の操作`}
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
              icon: ExternalLink,
              id: "details",
              label: "詳細・クラス割り当て",
              onClick: () => navigate(`/teachers/${teacher.teacherId}`),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
