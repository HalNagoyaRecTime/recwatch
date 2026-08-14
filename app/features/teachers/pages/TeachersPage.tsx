import { Plus } from "lucide-react";
import { useEffect } from "react";
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

type TeachersPageProps = {
  limit: number;
  offset: number;
  teachers: TeacherRow[];
  total: number;
};

export function TeachersPage({
  limit,
  offset,
  teachers,
  total,
}: TeachersPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: query, sortBy, sortOrder } =
    parseTeacherListUrl(searchParams);
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(
      updateTeacherListUrl(searchParams, { page: pageCount }),
      { replace: true }
    );
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateSearchParams(
    updates: Parameters<typeof updateTeacherListUrl>[1]
  ) {
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

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <Button
            icon={Plus}
            onClick={() => navigate(teacherCreateTarget(location.search))}
            size="lg"
            variant="primary"
          >
            新規登録
          </Button>
        }
        description="教官の基本情報を管理します"
        title="教官管理"
      />
      <div>
        <ImportUploadTrigger
          type="teachers"
          helperText="取り込み前にプレビューで内容・データ種別を確認できます"
        />
      </div>
      <SearchField
        ariaLabel="教官を検索"
        onValueChange={handleQueryChange}
        placeholder="氏名・クラス名で検索..."
        value={query}
      />
      <TeacherTable
        items={teachers}
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
            totalItems={total}
          />
        }
      />
    </div>
  );
}
