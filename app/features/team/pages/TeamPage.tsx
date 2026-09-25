import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { DeleteTeamDialog } from "~/features/team/components/DeleteTeamDialog";
import {
  parseTeamListUrl,
  updateTeamListUrl,
  type TeamListSortBy,
} from "~/features/team/application/team-list-url";
import { teamCreateTarget } from "~/features/team/application/team-navigation";
import { TeamTable } from "~/features/team/components/TeamTable";
import { TeamApi } from "~/features/team/api";
import { getNextManagementTableSort } from "~/features/user-management/model/management-table-sort";
import type { Team } from "~/features/team/model/team";
import { getErrorMessage } from "~/lib/client-error";

const sortByColumnId: Record<TeamListSortBy, string> = {
  teamName: "team-name",
  registeredAt: "registered-at",
  updatedAt: "updated-at",
};

const columnIdToSortBy: Record<string, TeamListSortBy> = {
  "team-name": "teamName",
  "registered-at": "registeredAt",
  "updated-at": "updatedAt",
};

type TeamPageProps = {
  limit: number;
  offset: number;
  teams: readonly Team[];
  total: number;
};

export function TeamPage({ limit, offset, teams, total }: TeamPageProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search, sortBy, sortOrder } = parseTeamListUrl(searchParams);
  const [removedTeamIds, setRemovedTeamIds] = useState<Set<number>>(
    () => new Set()
  );
  const [teamPendingDelete, setTeamPendingDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const items = teams.filter((team) => !removedTeamIds.has(team.id));
  const visibleTotal = Math.max(0, total - removedTeamIds.size);
  const pageCount = Math.max(1, Math.ceil(visibleTotal / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateTeamListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateUrl(updates: Parameters<typeof updateTeamListUrl>[1]) {
    setRemovedTeamIds(new Set());
    setSearchParams(updateTeamListUrl(searchParams, updates));
  }

  function handleSortChange(columnId: string) {
    const nextSortBy = columnIdToSortBy[columnId];
    if (!nextSortBy) return;

    const nextSort = getNextManagementTableSort(
      sortBy && sortOrder
        ? { columnId: sortBy, direction: sortOrder }
        : undefined,
      nextSortBy
    );
    updateUrl({
      page: 1,
      sortBy: nextSort.columnId as TeamListSortBy,
      sortOrder: nextSort.direction,
    });
  }

  async function confirmDelete() {
    if (!teamPendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await TeamApi.deleteTeam(teamPendingDelete.id);
      setRemovedTeamIds((current) => {
        const next = new Set(current);
        next.add(teamPendingDelete.id);
        return next;
      });
      setTeamPendingDelete(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <ButtonLink
            icon={Plus}
            size="lg"
            to={teamCreateTarget(location.search)}
            variant="primary"
          >
            新規登録
          </ButtonLink>
        }
        description="チームの登録内容を管理します"
        title="チーム管理"
      />
      <SearchField
        ariaLabel="チームを検索"
        onValueChange={(value) => updateUrl({ page: 1, search: value })}
        placeholder="チーム名で検索..."
        value={search}
      />
      <TeamTable
        items={items}
        onDeleteRequest={setTeamPendingDelete}
        onSortChange={handleSortChange}
        search={location.search}
        sort={
          sortBy && sortOrder
            ? { columnId: sortByColumnId[sortBy], direction: sortOrder }
            : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateUrl({ page: nextPage })}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={visibleTotal}
          />
        }
      />
      {teamPendingDelete ? (
        <DeleteTeamDialog
          isSubmitting={isDeleting}
          onClose={() => {
            setTeamPendingDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => void confirmDelete()}
          submitError={deleteError}
          team={teamPendingDelete}
        />
      ) : null}
    </div>
  );
}
