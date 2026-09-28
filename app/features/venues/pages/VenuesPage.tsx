import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import type { VenueGateway } from "~/features/venues/api/contracts/venue-gateway";
import { VenueForm } from "~/features/venues/components/form/VenueForm";
import { VenueTable } from "~/features/venues/components/list/VenueTable";
import { useVenuesPage } from "~/features/venues/hooks/useVenuesPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

type VenuesPageProps = {
  gateway: VenueGateway;
};

export function VenuesPage({ gateway }: VenuesPageProps) {
  const state = useVenuesPage({ gateway });

  return (
    <PageLayout
      right={
        state.isFormOpen ? (
          <ScrollbarArea className="h-full overscroll-y-contain">
            <div className="w-[min(24rem,90vw)] p-5 md:p-6">
              <VenueForm
                editingVenue={state.editingVenue}
                isSubmitting={state.isSubmitting}
                name={state.venueNameInput}
                onChange={state.handleVenueNameChange}
                onClose={state.closeForm}
                onSubmit={state.submitForm}
                submitError={state.submitError}
              />
            </div>
          </ScrollbarArea>
        ) : undefined
      }
    >
      <PagePadding>
        <div className="min-h-full space-y-6">
          <PageHeader
            actions={
              <Button
                disabled={state.isDeleting || state.isSubmitting}
                icon={Plus}
                onClick={state.openCreateForm}
                size="lg"
                variant="primary"
              >
                新規登録
              </Button>
            }
            description="競技を実施する場所を管理します"
            title="実施場所管理"
          />

          {state.loadError ? (
            <p
              aria-live="polite"
              className="text-tone-danger-text border-tone-danger-text/30 bg-tone-danger-surface rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {state.loadError}
            </p>
          ) : state.actionError ? (
            <p
              aria-live="polite"
              className="text-tone-danger-text border-tone-danger-text/30 bg-tone-danger-surface rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {state.actionError}
            </p>
          ) : state.isLoading ? (
            <div aria-live="polite" className="sr-only">
              実施場所を読み込み中
            </div>
          ) : null}

          <VenueTable
            currentPage={state.currentPage}
            isMutating={state.isDeleting || state.isSubmitting}
            isLoading={state.isLoading}
            items={state.venues}
            onDelete={state.handleDelete}
            onEdit={state.openEditForm}
            onPageChange={state.handlePageChange}
            onQueryChange={state.handleQueryChange}
            onSortChange={state.handleSortChange}
            pageCount={state.pageCount}
            pageSize={state.pageSize}
            query={state.query}
            sort={state.sort}
            totalItems={state.total}
          />
        </div>
      </PagePadding>
    </PageLayout>
  );
}
