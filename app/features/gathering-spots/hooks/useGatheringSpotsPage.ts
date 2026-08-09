import { useMemo, useState } from "react";

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
  const { spots, isLoading, loadError, createSpot, updateSpot } =
    useGatheringSpots({ gateway });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<GatheringSpotSort>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<GatheringSpot | null>(null);
  const [spotNameInput, setSpotNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? spots.filter((spot) =>
          spot.name.toLowerCase().includes(normalizedQuery)
        )
      : spots;

    if (!sort) return filtered;

    const collator = new Intl.Collator("ja", {
      numeric: true,
      sensitivity: "base",
    });

    return [...filtered].sort((left, right) => {
      const result =
        sort.columnId === "id"
          ? left.id - right.id
          : sort.columnId === "name"
            ? collator.compare(left.name, right.name)
            : sort.columnId === "created-at"
              ? collator.compare(left.createdAt, right.createdAt)
              : collator.compare(left.updatedAt, right.updatedAt);
      return sort.direction === "asc" ? result : -result;
    });
  }, [query, sort, spots]);

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
    setQuery(nextQuery);
  }

  function handleSpotNameChange(name: string) {
    setSpotNameInput(name);
  }

  function handleSortChange(columnId: string) {
    if (!isGatheringSpotSortableColumnId(columnId)) return;
    setSort((current) => getNextGatheringSpotSort(current, columnId));
  }

  async function submitForm() {
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

  return {
    closeForm,
    editingSpot,
    filteredSpots,
    handleQueryChange,
    handleSortChange,
    handleSpotNameChange,
    isFormOpen,
    isLoading,
    isSubmitting,
    loadError,
    openCreateForm,
    openEditForm,
    query,
    spotNameInput,
    submitError,
    submitForm,
    sort,
  };
}
