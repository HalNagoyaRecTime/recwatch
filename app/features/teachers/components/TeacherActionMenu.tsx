import { Ellipsis, Pencil, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { Menu, type MenuItemType } from "~/components/ui/navigation/Menu";
import { FloatingPanel } from "~/components/ui/panel/FloatingPanel";
import { teacherEditTarget } from "~/features/teachers/application/teacher-navigation";
import { TeacherApi } from "~/features/teachers/api";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { getErrorMessage } from "~/lib/client-error";

type TeacherActionMenuProps = {
  disabled?: boolean;
  teacher: TeacherRow;
};

export function TeacherActionMenu({
  disabled,
  teacher,
}: TeacherActionMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function updateUser(action: () => Promise<unknown>) {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      await action();
      // 現在の URL へ再遷移して、一覧ローダーを再検証します。
      await navigate(`${location.pathname}${location.search}`, {
        replace: true,
      });
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "教官の状態変更に失敗しました。"));
    } finally {
      setIsUpdating(false);
    }
  }

  const actionDisabled = disabled || isUpdating;
  const items: MenuItemType[] = [
    {
      disabled: actionDisabled,
      icon: Pencil,
      id: "edit",
      label: "教官を編集する",
      onClick: () => {
        setIsOpen(false);
        navigate(teacherEditTarget(teacher.teacherId, location.search));
      },
      type: "action",
    },
    {
      danger: teacher.isLiveActive,
      disabled: actionDisabled,
      icon: teacher.isLiveActive ? ShieldOff : ShieldCheck,
      id: "active",
      label: teacher.isLiveActive ? "教官を無効化する" : "教官を有効化する",
      onClick: () =>
        void updateUser(() =>
          TeacherApi.updateUserStatus(teacher.userId, {
            is_live_active: !teacher.isLiveActive,
          })
        ),
      type: "action",
    },
    {
      disabled: actionDisabled,
      icon: teacher.isStaff ? ShieldOff : ShieldCheck,
      id: "staff",
      label: teacher.isStaff ? "staff権限を解除する" : "staff権限を付与する",
      onClick: () =>
        void updateUser(() =>
          teacher.isStaff
            ? TeacherApi.revokeStaff(teacher.userId)
            : TeacherApi.assignStaff(teacher.userId)
        ),
      type: "action",
    },
  ];

  return (
    <FloatingPanel
      content={
        <div>
          <Menu items={items} />
          {isUpdating ? (
            <p className="text-text-muted px-3 py-2 text-xs">更新中...</p>
          ) : null}
          {errorMessage ? (
            <p className="text-tone-danger-text px-3 py-2 text-xs" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      trigger={
        <Button
          aria-label={`${teacher.displayName}の操作`}
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
