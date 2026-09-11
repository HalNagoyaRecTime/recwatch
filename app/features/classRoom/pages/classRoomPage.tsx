import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { FormModal } from "~/components/ui/modal/FormModal";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type {
  ClassRoomListSortBy,
  ClassRoomManagementApi,
} from "~/features/classRoom/api/contracts/class-room-api";
import {
  ClassRoomForm,
  type ClassRoomTeacherOption,
} from "~/features/classRoom/components/ClassRoomForm";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";
import { useClassRoomList } from "~/features/classRoom/hooks/useClassRoomList";
import { useClassRoomMutation } from "~/features/classRoom/hooks/useClassRoomMutation";
import { useClassRoomListUrl } from "~/features/classRoom/hooks/useClassRoomListUrl";
import { emptyClassRoomForm } from "~/features/classRoom/model/classRoom-form";
import type {
  ClassRoom,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

type ClassRoomPageProps = {
  api: ClassRoomManagementApi;
  items?: readonly ClassRoom[];
  limit?: number;
  offset?: number;
  onRevalidate?: () => Promise<void> | void;
  teacherOptions: readonly ClassRoomTeacherOption[];
  total?: number;
};

export function ClassRoomPage({
  api,
  items,
  limit: initialLimit,
  offset: initialOffset,
  onRevalidate,
  teacherOptions,
  total: initialTotal,
}: ClassRoomPageProps) {
  const location = useLocation();
  const {
    handleSortChange,
    page,
    search,
    searchInput,
    setSearchInput,
    sortBy,
    sortOrder,
    updateSearchParams,
  } = useClassRoomListUrl();
  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [form, setForm] = useState<ClassRoomWriteInput>(emptyClassRoomForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const pageSize = initialLimit ?? 50;
  const offset = initialOffset ?? (page - 1) * pageSize;
  const currentPage = Math.floor(offset / pageSize) + 1;
  const listQuery = useMemo(
    () => ({
      limit: pageSize,
      offset,
      search: search || undefined,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
    }),
    [offset, pageSize, search, sortBy, sortOrder]
  );
  const {
    error: loadError,
    isLoading,
    items: listItems,
    refresh,
    total: listTotal,
  } = useClassRoomList({
    api,
    initialItems: items,
    initialTotal,
    onRevalidate,
    query: listQuery,
  });
  const {
    clearError,
    error: actionError,
    isMutating,
    remove,
    update,
  } = useClassRoomMutation({ api, refresh });
  const pageCount = Math.max(1, Math.ceil(listTotal / pageSize));

  useEffect(() => {
    if (currentPage <= pageCount) return;
    updateSearchParams({ page: pageCount }, true);
  }, [currentPage, pageCount, updateSearchParams]);

  function openEditForm(classRoom: ClassRoom) {
    setEditing(classRoom);
    setForm({
      classCode: classRoom.classCode,
      className: classRoom.className,
      teacherId: classRoom.teacher?.teacherId ?? null,
    });
    clearError();
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyClassRoomForm);
    clearError();
  }

  async function saveClassRoom(input: ClassRoomWriteInput) {
    if (!editing) return;

    if (await update(editing.classRoomId, input)) {
      closeForm();
    }
  }

  async function deleteClassRoom(classRoom: ClassRoom) {
    if (
      isMutating ||
      !window.confirm(
        `「${classRoom.className}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    const refreshed = await remove(classRoom.classRoomId);
    if (
      refreshed &&
      refreshed.items.length === 0 &&
      refreshed.total > 0 &&
      currentPage > 1
    ) {
      updateSearchParams({ page: currentPage - 1 }, true);
    }
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
              to={{ pathname: "/classroom/new", search: location.search }}
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

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : null}

      <ClassRoomTable
        emptyMessage={
          isLoading
            ? "クラスを読み込んでいます..."
            : search
              ? "検索条件に一致するクラスが見つかりません。"
              : undefined
        }
        footer={
          <Pagination
            currentPage={currentPage}
            onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={listTotal}
          />
        }
        isMutating={isMutating}
        items={isLoading ? [] : listItems}
        onDelete={deleteClassRoom}
        onEdit={openEditForm}
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

      {!isFormOpen && actionError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {actionError}
        </p>
      ) : null}

      {isFormOpen ? (
        <FormModal
          description="クラスコード、クラス名、担当教官を入力します"
          onClose={closeForm}
          title="クラスを編集"
        >
          <ClassRoomForm
            form={form}
            isSubmitting={isMutating}
            onCancel={closeForm}
            onChange={setForm}
            onSubmit={saveClassRoom}
            submitError={actionError}
            teacherOptions={teacherOptions}
          />
        </FormModal>
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
