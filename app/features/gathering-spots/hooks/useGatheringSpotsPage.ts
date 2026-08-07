import { useMemo, useState } from "react";

import type { GatheringSpotSortBy } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import { useGatheringSpots } from "~/features/gathering-spots/hooks/useGatheringSpots";
import {
  getNextGatheringSpotSort,
  isGatheringSpotSortableColumnId,
  type GatheringSpot,
  type GatheringSpotSort,
} from "~/features/gathering-spots/model/gathering-spot";

type UseGatheringSpotsPageOptions = {
  gateway: GatheringSpotGateway;
};

export function useGatheringSpotsPage({
  gateway,
}: UseGatheringSpotsPageOptions) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<GatheringSpotSort>();
  const pageSize = 20;
  const listOptions = useMemo(
    () => ({
      limit: pageSize,
      name: query.trim() || undefined,
      offset: (currentPage - 1) * pageSize,
      ...(sort
        ? {
            sortBy: toApiSortBy(sort.columnId),
            sortOrder: sort.direction,
          }
        : {}),
    }),
    [currentPage, query, sort]
  );
  const {
    spots,
    total,
    isLoading,
    loadError,
    createSpot,
    updateSpot,
    deleteSpot,
    reload,
  } = useGatheringSpots({ gateway, listOptions });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<GatheringSpot | null>(null);
  const [spotNameInput, setSpotNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreateForm() {
    setEditingSpot(null);
    setSpotNameInput("");
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function openEditForm(spot: GatheringSpot) {
    setEditingSpot(spot);
    setSpotNameInput(spot.name);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingSpot(null);
    setSpotNameInput("");
    setSubmitError(null);
  }

  function handleQueryChange(nextQuery: string) {
    if (isDeleting || isSubmitting) return;
    setQuery(nextQuery);
    setCurrentPage(1);
  }

  function handlePageChange(nextPage: number) {
    if (isDeleting || isSubmitting) return;
    setCurrentPage(Math.min(Math.max(1, nextPage), pageCount));
  }

  async function handleDelete(spot: GatheringSpot) {
    if (isDeleting || isSubmitting) return;
    if (!window.confirm(`「${spot.name}」を削除しますか？`)) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteSpot(spot.id);
      const nextPage = await reload();
      if (
        nextPage?.items.length === 0 &&
        nextPage.total > 0 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "集合場所の削除に失敗しました。"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleSpotNameChange(name: string) {
    setSpotNameInput(name);
  }

  function handleSortChange(columnId: string) {
    if (isDeleting || isSubmitting) return;
    if (!isGatheringSpotSortableColumnId(columnId)) return;
    setSort((current) => getNextGatheringSpotSort(current, columnId));
  }

  async function submitForm() {
    if (isSubmitting || isDeleting) return;

    const name = spotNameInput.trim();
    if (!name) {
      setSubmitError("集合場所名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingSpot) {
        await updateSpot(editingSpot.id, name);
      } else {
        await createSpot(name);
      }
      await reload();
      closeForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "集合場所の保存に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    closeForm,
    actionError,
    currentPage,
    editingSpot,
    handleDelete,
    handlePageChange,
    handleQueryChange,
    handleSortChange,
    handleSpotNameChange,
    isFormOpen,
    isDeleting,
    isLoading,
    isSubmitting,
    loadError,
    openCreateForm,
    openEditForm,
    pageCount,
    pageSize,
    query,
    spotNameInput,
    submitError,
    submitForm,
    sort,
    spots,
    total,
  };
}

function toApiSortBy(
  columnId: GatheringSpotSort["columnId"]
): GatheringSpotSortBy {
  switch (columnId) {
    case "created-at":
      return "createdAt";
    case "updated-at":
      return "updatedAt";
    default:
      return columnId;
  }
}
