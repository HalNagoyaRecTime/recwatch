import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { DeleteTeamDialog } from "~/features/team/components/DeleteTeamDialog";
import {
  parseTeamListUrl,
  updateTeamListUrl,
} from "~/features/team/application/team-list-url";
import {
  teamCreateTarget,
  teamListTarget,
} from "~/features/team/application/team-navigation";
import { TeamTable } from "~/features/team/components/TeamTable";
import { deleteTeam } from "~/features/team/mock/team-store";
import type { Team } from "~/features/team/model/team";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

const PAGE_SIZE = 10;

export function TeamPage({ teams }: { teams: readonly Team[] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, search, sortBy, sortOrder } = parseTeamListUrl(searchParams);
  const [teamPendingDelete, setTeamPendingDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // rectime-apiのGET /teams?searchはチーム名の部分一致のみに対応しているため、
  // モックの検索範囲もチーム名のみに揃える。
  const filteredTeams = useMemo(() => {
    const normalizedSearch = search.toLocaleLowerCase();
    return teams.filter(
      (team) =>
        !normalizedSearch ||
        team.name.toLocaleLowerCase().includes(normalizedSearch)
    );
  }, [search, teams]);

  const sortedTeams = useMemo(
    () =>
      sortManagementTableItems(
        filteredTeams,
        sortBy && sortOrder
          ? { columnId: sortBy, direction: sortOrder }
          : undefined,
        (team, columnId) => {
          switch (columnId) {
            case "teamName":
              return team.name;
            case "registeredAt":
              return team.registeredAt;
            case "updatedAt":
              return team.updatedAt;
            default:
              return null;
          }
        }
      ),
    [filteredTeams, sortBy, sortOrder]
  );
  const pageCount = Math.max(1, Math.ceil(sortedTeams.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleTeams = sortedTeams.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (page <= pageCount) return;
    setSearchParams(updateTeamListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [page, pageCount, searchParams, setSearchParams]);

  function updateUrl(updates: Parameters<typeof updateTeamListUrl>[1]) {
    setSearchParams(updateTeamListUrl(searchParams, updates));
  }

  function handleSortChange(columnId: string) {
    const nextSortBy = {
      "team-name": "teamName",
      "registered-at": "registeredAt",
      "updated-at": "updatedAt",
    }[columnId];
    if (!nextSortBy) return;

    const nextSort = getNextManagementTableSort(
      sortBy && sortOrder
        ? { columnId: sortBy, direction: sortOrder }
        : undefined,
      nextSortBy
    );
    updateUrl({
      page: 1,
      sortBy: nextSort.columnId as Parameters<
        typeof updateTeamListUrl
      >[1]["sortBy"],
      sortOrder: nextSort.direction,
    });
  }

  async function confirmDelete() {
    if (!teamPendingDelete) return;
    setIsDeleting(true);
    try {
      deleteTeam(teamPendingDelete.id);
      setTeamPendingDelete(null);
      navigate(teamListTarget(location.search), { replace: true });
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
        items={visibleTeams}
        onDeleteRequest={setTeamPendingDelete}
        onSortChange={handleSortChange}
        search={location.search}
        sort={
          sortBy && sortOrder
            ? {
                columnId: {
                  teamName: "team-name",
                  registeredAt: "registered-at",
                  updatedAt: "updated-at",
                }[sortBy],
                direction: sortOrder,
              }
            : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateUrl({ page: nextPage })}
            pageCount={pageCount}
            pageSize={PAGE_SIZE}
            totalItems={sortedTeams.length}
          />
        }
      />
      {teamPendingDelete ? (
        <DeleteTeamDialog
          isSubmitting={isDeleting}
          onClose={() => setTeamPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
          team={teamPendingDelete}
        />
      ) : null}
    </div>
  );
}
