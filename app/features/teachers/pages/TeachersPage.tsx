import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import {
  parseTeacherListUrl,
  updateTeacherListUrl,
} from "~/features/teachers/application/teacher-list-url";
import { teacherCreateTarget } from "~/features/teachers/application/teacher-navigation";
import { UserManagementTabs } from "~/features/user-management/components/UserManagementTabs";
import { TeacherApi } from "~/features/teachers/api";

type TeacherDeletionApi = {
  deleteTeacher(teacherId: number): Promise<unknown>;
};

type TeachersPageProps = {
  api?: TeacherDeletionApi;
  limit: number;
  offset: number;
  teachers: TeacherRow[];
  total: number;
};

export function TeachersPage({
  api = TeacherApi,
  limit,
  offset,
  teachers,
  total,
}: TeachersPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [removedTeacherIds, setRemovedTeacherIds] = useState<Set<number>>(
    () => new Set()
  );
  const [isMutating, setIsMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    search: query,
    sortBy,
    sortOrder,
  } = parseTeacherListUrl(searchParams);
  const currentPage = Math.floor(offset / limit) + 1;
  const items = teachers.filter(
    (teacher) => !removedTeacherIds.has(teacher.teacherId)
  );
  const visibleTotal = Math.max(0, total - removedTeacherIds.size);
  const pageCount = Math.max(1, Math.ceil(visibleTotal / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setRemovedTeacherIds(new Set());
    setSearchParams(updateTeacherListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateSearchParams(
    updates: Parameters<typeof updateTeacherListUrl>[1]
  ) {
    setRemovedTeacherIds(new Set());
    setSearchParams(updateTeacherListUrl(searchParams, updates));
  }

  function handleQueryChange(nextQuery: string) {
    updateSearchParams({ page: 1, search: nextQuery });
  }

  function handlePageChange(nextPage: number) {
    updateSearchParams({ page: nextPage });
  }

  function handleSortChange(columnId: string) {
    const nextSortBy = columnId === "teacher-id" ? "teacherId" : "displayName";
    const nextSortOrder =
      sortBy === nextSortBy && sortOrder === "asc" ? "desc" : "asc";
    updateSearchParams({
      page: 1,
      sortBy: nextSortBy,
      sortOrder: nextSortOrder,
    });
  }

  async function deleteTeacher(teacher: TeacherRow) {
    if (
      isMutating ||
      !window.confirm(
        `「${teacher.displayName}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    setIsMutating(true);
    setActionError(null);
    try {
      await api.deleteTeacher(teacher.teacherId);
      setRemovedTeacherIds((current) => {
        const next = new Set(current);
        next.add(teacher.teacherId);
        return next;
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "教官を削除できませんでした。"
      );
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader description="教官の基本情報を管理します" title="教官管理" />
      <ImportUploadTrigger
        adjacentAction={
          <Button
            icon={Plus}
            onClick={() => navigate(teacherCreateTarget(location.search))}
            variant="secondary"
          >
            新規登録
          </Button>
        }
        type="teachers"
        helperText="取り込み前にプレビューで内容・データ種別を確認できます"
      />
      <UserManagementTabs active="teachers" />
      <SearchField
        ariaLabel="教官を検索"
        onValueChange={handleQueryChange}
        placeholder="氏名・クラス名で検索..."
        value={query}
      />
      {actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {actionError}
        </p>
      ) : null}
      <TeacherTable
        isMutating={isMutating}
        items={items}
        onDelete={(teacher) => void deleteTeacher(teacher)}
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? {
                columnId:
                  sortBy === "teacherId" ? "teacher-id" : "display-name",
                direction: sortOrder ?? "asc",
              }
            : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={visibleTotal}
          />
        }
      />
    </div>
  );
}
