import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type {
  ClassRoomListSortBy,
  ClassRoomMutationApi,
} from "~/features/classRoom/api/contracts/class-room-api";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import { useClassRoomListUrl } from "~/features/classRoom/hooks/useClassRoomListUrl";
import type { ClassRoom } from "~/features/classRoom/model/classRoom";
import { clearClassRoomMembershipUrl } from "~/features/students/application/class-room-membership-url";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

type ClassRoomPageProps = {
  api: ClassRoomMutationApi;
  items: readonly ClassRoom[];
  limit: number;
  offset: number;
  onRevalidate: () => Promise<void> | void;
  total: number;
};

export function ClassRoomPage({
  api,
  items,
  limit,
  offset,
  onRevalidate,
  total,
}: ClassRoomPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    handleSortChange,
    search,
    searchInput,
    setSearchInput,
    sortBy,
    sortOrder,
    updateSearchParams,
  } = useClassRoomListUrl();
  const currentPage = Math.floor(offset / limit) + 1;
  const {
    error: actionError,
    isMutating,
    remove,
  } = useClassRoomMutation({ api, onRevalidate });
  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    updateSearchParams({ page: pageCount }, true);
  }, [currentPage, pageCount, updateSearchParams]);

  async function deleteClassRoom(classRoom: ClassRoom) {
    if (
      isMutating ||
      !window.confirm(
        `「${classRoom.className}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    await remove(classRoom.classRoomId);
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <ImportUploadTrigger showHelperText={false} type="classrooms" />
            <ButtonLink
              icon={Plus}
              size="lg"
              to={{ pathname: "/classrooms/new", search: location.search }}
              variant="primary"
            >
              新規登録
            </ButtonLink>
          </div>
        }
        description="クラスの基本情報と担当教官を管理します"
        title="クラス管理"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">
          <SearchField
            ariaLabel="クラスを検索"
            onValueChange={setSearchInput}
            placeholder="クラスコード・クラス名・担当教官で検索..."
            value={searchInput}
          />
        </div>
      </div>

      <ClassRoomTable
        emptyMessage={
          search ? "検索条件に一致するクラスが見つかりません。" : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
            pageCount={pageCount}
            pageSize={limit}
            totalItems={total}
          />
        }
        isMutating={isMutating}
        items={items}
        onDelete={deleteClassRoom}
        onEdit={(classRoom) =>
          navigate({
            pathname: `/classrooms/${classRoom.classRoomId}/edit`,
            search: clearClassRoomMembershipUrl(location.search),
          })
        }
        onSortChange={handleSortChange}
        sort={
          sortBy
            ? {
                columnId: sortColumnId(sortBy),
                direction: sortOrder ?? "asc",
              }
            : undefined
        }
      />

      {actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}

function sortColumnId(sortBy: ClassRoomListSortBy) {
  return {
    classRoomId: "class-room-id",
    classCode: "class-room-code",
    className: "class-room-name",
    teacherName: "teacher-name",
    studentCount: "student-count",
  }[sortBy];
}
