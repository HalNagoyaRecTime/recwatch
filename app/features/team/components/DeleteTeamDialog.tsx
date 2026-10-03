import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button/Button";
import type { Team } from "~/features/team/model/team";

type DeleteTeamDialogProps = {
  team: Team;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitError?: string | null;
};

export function DeleteTeamDialog({
  team,
  isSubmitting,
  onClose,
  onConfirm,
  submitError,
}: DeleteTeamDialogProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-team-title"
        aria-describedby="delete-team-description"
        className="app-rounded border-border-base bg-surface-base shadow-soft w-full max-w-[420px] border p-5"
      >
        <div className="flex items-start gap-3">
          <span className="bg-tone-danger-surface text-tone-danger-text inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <AlertTriangleIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="delete-team-title" className="font-semibold">
              このチームを削除しますか？
            </h2>
            <p
              id="delete-team-description"
              className="text-text-muted mt-2 text-sm leading-6"
            >
              「{team.name}
              」を削除すると、登録済みのクラス・得点も一覧から見えなくなります。この操作は元に戻せません。
            </p>
          </div>
        </div>
        {submitError ? (
          <p className="text-tone-danger-text mt-3 text-sm" role="alert">
            {submitError}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            autoFocus
            disabled={isSubmitting}
            onClick={onClose}
            size="md"
            variant="secondary"
          >
            戻る
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={onConfirm}
            size="md"
            variant="danger"
          >
            {isSubmitting ? "削除中..." : "削除する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
