import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import type { DataTableSort } from "~/components/ui/data-table/data-table-types";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { CompetitionListGateway } from "~/features/sports/api/competition-list-gateway";
import { httpCompetitionListGateway } from "~/features/sports/api/http-competition-list-gateway";
import { CompetitionTable } from "~/features/sports/components/CompetitionTable";
import type { CompetitionListItem } from "~/features/sports/model/competition-list-item";
import {
  getNextManagementTableSort,
  sortManagementTableItems,
} from "~/features/user-management/model/management-table-sort";

type CompetitionListPageProps = {
  gateway?: CompetitionListGateway;
};

export function CompetitionListPage({
  gateway = httpCompetitionListGateway,
}: CompetitionListPageProps) {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<CompetitionListItem[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DataTableSort>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    gateway
      .load()
      .then((items) => {
        if (!isCurrent) return;
        setCompetitions(items);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "イベント一覧を取得できませんでした。"
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [gateway]);

  const filteredCompetitions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return competitions;

    return competitions.filter((competition) =>
      [competition.name, competition.venue, competition.meetingPlace].some(
        (value) => value.toLocaleLowerCase("ja").includes(normalizedQuery)
      )
    );
  }, [competitions, query]);

  const visibleCompetitions = useMemo(
    () =>
      sortManagementTableItems(
        filteredCompetitions,
        sort,
        (competition, columnId) => {
          switch (columnId) {
            case "event-id":
              return competition.code;
            case "event-name":
              return competition.name;
            case "venue":
              return competition.venue;
            case "event-time":
              return `${competition.startTime}-${competition.endTime}`;
            case "gathering":
              return `${competition.meetingTime}-${competition.meetingPlace}`;
            default:
              return null;
          }
        }
      ),
    [filteredCompetitions, sort]
  );

  async function deleteCompetition(competition: CompetitionListItem) {
    if (
      isDeleting ||
      !window.confirm(`「${competition.name}」を削除します。よろしいですか？`)
    ) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    try {
      await gateway.delete(competition.id);
      setCompetitions((current) =>
        current.filter((item) => item.id !== competition.id)
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "イベントを削除できませんでした。"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <ButtonLink icon={Plus} size="lg" to="/events/new" variant="primary">
            新規登録
          </ButtonLink>
        }
        description="イベント情報の登録・編集・確認ができます"
        title="イベント登録一覧"
      />

      {loadError || actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError ?? actionError}
        </p>
      ) : null}

      <SearchField
        ariaLabel="イベントを検索"
        onValueChange={setQuery}
        placeholder="イベント名・実施場所・集合場所で検索..."
        value={query}
      />

      <CompetitionTable
        emptyMessage={
          isLoading
            ? "イベントを読み込んでいます..."
            : query
              ? "検索条件に一致するイベントが見つかりません。"
              : "登録済みのイベントはありません。"
        }
        isMutating={isDeleting}
        items={visibleCompetitions}
        onDelete={(competition) => void deleteCompetition(competition)}
        onEdit={(competition) => navigate(`/events/${competition.id}/edit`)}
        onSortChange={(columnId) =>
          setSort((current) => getNextManagementTableSort(current, columnId))
        }
        sort={sort}
      />
    </div>
  );
}
