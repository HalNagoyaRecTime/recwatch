import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { FormModal } from "~/components/ui/modal/FormModal";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type {
  ClassRoomListSortBy,
  ClassRoomManagementApi,
} from "~/features/classRoom/api";
import { ClassRoomApi } from "~/features/classRoom/api";
import {
  parseClassRoomListUrl,
  updateClassRoomListUrl,
} from "~/features/classRoom/application/class-room-list-url";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";
import type {
  ClassRoomData,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import { getErrorMessage } from "~/lib/client-error";

type TeacherOption = {
  teacherId: number;
  displayName: string;
};

type ClassRoomPageProps = {
  api?: ClassRoomManagementApi;
  classRooms?: readonly ClassRoomData[];
  items?: readonly ClassRoomData[];
  limit?: number;
  offset?: number;
  onRevalidate?: () => Promise<void> | void;
  teacherOptions: readonly TeacherOption[];
  total?: number;
};

const emptyForm: ClassRoomWriteInput = {
  classCode: "",
  className: "",
  teacherId: null,
};

export function ClassRoomPage({
  api = ClassRoomApi,
  classRooms,
  items,
  limit: initialLimit,
  offset: initialOffset,
  onRevalidate,
  teacherOptions,
  total: initialTotal,
}: ClassRoomPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, search, sortBy, sortOrder } =
    parseClassRoomListUrl(searchParams);
  const [searchInput, setSearchInput] = useState(search);
  const [editing, setEditing] = useState<ClassRoomData | null>(null);
  const [form, setForm] = useState<ClassRoomWriteInput>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listItems, setListItems] = useState<ClassRoomData[]>(() => [
    ...(items ?? classRooms ?? []),
  ]);
  const [listTotal, setListTotal] = useState(
    initialTotal ?? (items ?? classRooms ?? []).length
  );
  const [isLoading, setIsLoading] = useState(
    items === undefined && classRooms === undefined
  );
  const pageSize = initialLimit ?? 50;
  const offset = initialOffset ?? (page - 1) * pageSize;
  const currentPage = Math.floor(offset / pageSize) + 1;
  const pageCount = Math.max(1, Math.ceil(listTotal / pageSize));
  const hasLoaderData = items !== undefined || classRooms !== undefined;
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

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = window.setTimeout(() => {
      setSearchParams(
        updateClassRoomListUrl(searchParams, {
          page: 1,
          search: searchInput,
        })
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, searchParams, setSearchParams]);

  useEffect(() => {
    if (!hasLoaderData) return;
    setListItems([...(items ?? classRooms ?? [])]);
    setListTotal(initialTotal ?? (items ?? classRooms ?? []).length);
    setIsLoading(false);
  }, [classRooms, hasLoaderData, initialTotal, items]);

  useEffect(() => {
    if (hasLoaderData) return;
    let isCurrent = true;
    setIsLoading(true);
    api
      .getClassRoomList(listQuery)
      .then((result) => {
        if (!isCurrent) return;
        setListItems(result.items);
        setListTotal(result.total);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            getErrorMessage(error, "クラス一覧の取得に失敗しました。")
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [api, hasLoaderData, listQuery]);

  useEffect(() => {
    if (currentPage <= pageCount) return;
    setSearchParams(updateClassRoomListUrl(searchParams, { page: pageCount }), {
      replace: true,
    });
  }, [currentPage, pageCount, searchParams, setSearchParams]);

  function updateSearchParams(
    updates: Parameters<typeof updateClassRoomListUrl>[1],
    replace = false
  ) {
    setSearchParams(updateClassRoomListUrl(searchParams, updates), { replace });
  }

  function handleSortChange(columnId: string) {
    const sortColumns: Record<string, ClassRoomListSortBy> = {
      "class-room-id": "classRoomId",
      "class-room-code": "classCode",
      "class-room-name": "className",
      "teacher-name": "teacherName",
      "student-count": "studentCount",
    };
    const nextSortBy = sortColumns[columnId];
    if (!nextSortBy) return;

    setSearchParams((currentSearchParams) => {
      const currentState = parseClassRoomListUrl(currentSearchParams);
      const nextSortOrder =
        currentState.sortBy === nextSortBy && currentState.sortOrder === "asc"
          ? "desc"
          : "asc";
      return updateClassRoomListUrl(currentSearchParams, {
        page: 1,
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
      });
    });
  }

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setActionError(null);
    setIsFormOpen(true);
  }

  function openEditForm(classRoom: ClassRoomData) {
    setEditing(classRoom);
    setForm({
      classCode: classRoom.classCode,
      className: classRoom.className,
      teacherId: classRoom.teacher?.teacherId ?? null,
    });
    setActionError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setActionError(null);
  }

  async function refreshList() {
    if (onRevalidate) {
      await onRevalidate();
      return null;
    }

    const refreshed = await api.getClassRoomList(listQuery);
    setListItems(refreshed.items);
    setListTotal(refreshed.total);
    setLoadError(null);
    return refreshed;
  }

  async function saveClassRoom() {
    if (isMutating) return;

    const input = {
      classCode: form.classCode.trim(),
      className: form.className.trim(),
      teacherId: form.teacherId,
    };
    if (!input.classCode || !input.className) {
      setActionError("クラスコードとクラス名を入力してください。");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    try {
      if (editing) {
        await api.updateClassRoom(editing.classRoomId, input);
      } else {
        await api.createClassRoom(input);
      }
      await refreshList();
      closeForm();
    } catch (error) {
      setActionError(getErrorMessage(error, "クラスを保存できませんでした。"));
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteClassRoom(classRoom: ClassRoomData) {
    if (
      isMutating ||
      !window.confirm(
        `「${classRoom.className}」を削除します。よろしいですか？`
      )
    ) {
      return;
    }

    setIsMutating(true);
    setActionError(null);
    try {
      await api.deleteClassRoom(classRoom.classRoomId);
      const refreshed = await refreshList();
      if (
        refreshed &&
        refreshed.items.length === 0 &&
        refreshed.total > 0 &&
        currentPage > 1
      ) {
        updateSearchParams({ page: currentPage - 1 }, true);
      }
    } catch (error) {
      setActionError(getErrorMessage(error, "クラスを削除できませんでした。"));
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <ImportUploadTrigger showHelperText={false} type="classrooms" />
            <Button
              disabled={isLoading || isMutating}
              icon={Plus}
              onClick={openCreateForm}
              size="lg"
              type="button"
              variant="primary"
            >
              新規登録
            </Button>
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
          title={editing ? "クラスを編集" : "クラスの新規登録"}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveClassRoom();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-text-base text-sm font-medium">
                クラスコード <span className="text-tone-danger-text">*</span>
                <input
                  aria-label="クラスコード*"
                  className={inputClassName}
                  disabled={isMutating}
                  maxLength={50}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setForm((current) => ({ ...current, classCode: value }));
                  }}
                  value={form.classCode}
                />
              </label>
              <label className="text-text-base text-sm font-medium">
                クラス名 <span className="text-tone-danger-text">*</span>
                <input
                  aria-label="クラス名*"
                  className={inputClassName}
                  disabled={isMutating}
                  maxLength={100}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setForm((current) => ({ ...current, className: value }));
                  }}
                  value={form.className}
                />
              </label>
            </div>
            <label className="text-text-base block text-sm font-medium">
              担当教官
              <select
                aria-label="担当教官"
                className={inputClassName}
                disabled={isMutating}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setForm((current) => ({
                    ...current,
                    teacherId: value ? Number(value) : null,
                  }));
                }}
                value={form.teacherId ?? ""}
              >
                <option value="">未設定</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.displayName}
                  </option>
                ))}
              </select>
            </label>
            {actionError ? (
              <p className="text-tone-danger-text text-sm" role="alert">
                {actionError}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button
                disabled={isMutating}
                onClick={closeForm}
                type="button"
                variant="secondary"
              >
                キャンセル
              </Button>
              <Button disabled={isMutating} type="submit" variant="primary">
                {isMutating ? "保存中..." : "保存する"}
              </Button>
            </div>
          </form>
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

const inputClassName =
  "border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-9 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-50";
