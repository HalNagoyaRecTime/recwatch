import { useMemo, useState } from "react";

import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import { useGatheringSpots } from "~/features/gathering-spots/hooks/useGatheringSpots";
import type { GatheringSpot } from "~/features/gathering-spots/model/gathering-spot";

type UseGatheringSpotsPageOptions = {
  gateway: GatheringSpotGateway;
};

export function useGatheringSpotsPage({
  gateway,
}: UseGatheringSpotsPageOptions) {
  const { spots, isLoading, loadError, createSpot, updateSpot } =
    useGatheringSpots({ gateway });
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<GatheringSpot | null>(null);
  const [spotNameInput, setSpotNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return spots;

    return spots.filter((spot) =>
      spot.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, spots]);

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
  };
}
