import { Ellipsis, Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type TeacherActionMenuProps = {
  teacher: TeacherRow;
};

export function TeacherActionMenu({ teacher }: TeacherActionMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
              icon: Pencil,
              id: "edit",
              label: "編集",
              onClick: () =>
                navigate({
                  pathname: `/teachers/${teacher.teacherId}/edit`,
                  search: location.search,
                }),
              type: "action",
            },
          ]}
        />
      }
    />
  );
}
