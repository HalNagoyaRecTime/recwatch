import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { getErrorMessage } from "~/lib/client-error";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";
import {
  httpParticipantAssignmentGateway,
  type ParticipantAssignmentGateway,
} from "../api/http-participant-assignment-gateway";
import { ParticipantAssignmentTable } from "../components/ParticipantAssignmentTable";
import type { ParticipantAssignment } from "../model/participant-assignment";

type ParticipantsPageProps = {
  gateway?: ParticipantAssignmentGateway;
};

export function ParticipantsPage({
  gateway = httpParticipantAssignmentGateway,
}: ParticipantsPageProps) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<ParticipantAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [sort, setSort] = useState<DataTableSort>();

  useEffect(() => {
    let active = true;

    gateway
      .load()
      .then((result) => {
        if (active) setAssignments(result);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setAssignments([]);
        setError(
          getErrorMessage(loadError, "出場メンバーを取得できませんでした。")
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gateway, reloadKey]);

  const visibleAssignments = useMemo(
    () =>
      sortManagementTableItems(assignments, sort, (assignment, columnId) => {
        switch (columnId) {
          case "event-name":
            return assignment.eventName;
          case "class-room":
            return assignment.classNames.join("、");
          case "time":
            return assignment.eventTime;
          case "gathering":
            return `${assignment.gatheringSpotName} ${assignment.gatheringTime}`;
          case "members":
            return assignment.memberNames.join("、");
          default:
            return null;
        }
      }),
    [assignments, sort]
  );

  async function deleteAssignment(assignment: ParticipantAssignment) {
    if (
      isDeleting ||
      !window.confirm(
        `「${assignment.eventName}」（${assignment.gatheringSpotName} / ${assignment.gatheringTime}）の集合予定と参加者設定を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await gateway.delete(assignment.gatheringId);
      setAssignments((current) =>
        current.filter((item) => item.gatheringId !== assignment.gatheringId)
      );
    } catch (deleteError) {
      setError(
        getErrorMessage(deleteError, "参加者設定を削除できませんでした。")
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        title="出場メンバー管理"
        description="イベントごとの集合予定と設定済みメンバーを確認します"
        actions={
          <ButtonLink
            icon={Plus}
            size="lg"
            to="/events/assignments"
            variant="primary"
          >
            参加者を設定
          </ButtonLink>
        }
      />

      {error ? (
        <div className="app-rounded border-tone-danger-border bg-tone-danger-bg text-tone-danger-text flex items-center justify-between gap-4 border px-4 py-3 text-sm">
          <p>{error}</p>
          <Button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              setReloadKey((current) => current + 1);
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            再試行
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="app-rounded border-border-base bg-surface-base text-text-muted flex min-h-48 items-center justify-center gap-2 border text-sm">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          読み込み中...
        </div>
      ) : (
        <ParticipantAssignmentTable
          assignments={visibleAssignments}
          emptyMessage={
            error
              ? "一覧を表示できません"
              : "設定済みの出場メンバーはありません。"
          }
          isMutating={isDeleting}
          onDelete={(assignment) => void deleteAssignment(assignment)}
          onEdit={(assignment) =>
            navigate(
              `/events/assignments?eventId=${assignment.eventId}&gatheringId=${assignment.gatheringId}`
            )
          }
          onSortChange={(columnId) =>
            setSort((current) => getNextManagementTableSort(current, columnId))
          }
          sort={sort}
        />
      )}
    </div>
  );
}
