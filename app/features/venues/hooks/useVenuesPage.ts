import { useMemo, useState } from "react";
import { getErrorMessage } from "~/lib/client-error";

import type { VenueGateway } from "~/features/venues/api/contracts/venue-gateway";
import { useVenues } from "~/features/venues/hooks/useVenues";
import {
  getNextVenueSort,
  isVenueSortableColumnId,
  type Venue,
  type VenueSort,
} from "~/features/venues/model/venue";

type UseVenuesPageOptions = {
  gateway: VenueGateway;
};

export function useVenuesPage({ gateway }: UseVenuesPageOptions) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<VenueSort>();
  const pageSize = 20;
  const listOptions = useMemo(
    () => ({
      limit: pageSize,
      name: query.trim() || undefined,
      offset: (currentPage - 1) * pageSize,
      ...(sort ? { sort } : {}),
    }),
    [currentPage, query, sort]
  );
  const {
    venues,
    total,
    isLoading,
    loadError,
    createVenue,
    updateVenue,
    deleteVenue,
    reload,
  } = useVenues({ gateway, listOptions });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueNameInput, setVenueNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreateForm() {
    setEditingVenue(null);
    setVenueNameInput("");
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function openEditForm(venue: Venue) {
    setEditingVenue(venue);
    setVenueNameInput(venue.name);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingVenue(null);
    setVenueNameInput("");
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

  async function handleDelete(venue: Venue) {
    if (isDeleting || isSubmitting) return;
    if (!window.confirm(`「${venue.name}」を削除しますか？`)) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteVenue(venue.id);
      const nextPage = await reload();
      if (
        nextPage?.items.length === 0 &&
        nextPage.total > 0 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
      }
    } catch (error) {
      // 競技で使われている場合は API の 409 メッセージをそのまま表示する
      setActionError(getErrorMessage(error, "実施場所の削除に失敗しました。"));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleVenueNameChange(name: string) {
    setVenueNameInput(name);
  }

  function handleSortChange(columnId: string) {
    if (isDeleting || isSubmitting) return;
    if (!isVenueSortableColumnId(columnId)) return;
    setSort((current) => getNextVenueSort(current, columnId));
  }

  async function submitForm() {
    if (isSubmitting || isDeleting) return;

    const name = venueNameInput.trim();
    if (!name) {
      setSubmitError("実施場所名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, name);
      } else {
        await createVenue(name);
      }
      await reload();
      closeForm();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "実施場所の保存に失敗しました。"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    closeForm,
    actionError,
    currentPage,
    editingVenue,
    handleDelete,
    handlePageChange,
    handleQueryChange,
    handleSortChange,
    handleVenueNameChange,
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
    venueNameInput,
    submitError,
    submitForm,
    sort,
    venues,
    total,
  };
}
