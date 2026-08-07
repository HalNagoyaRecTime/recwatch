import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { ScrollbarArea } from "~/components/ui/scrollbar/ScrollbarArea";
import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import { GatheringSpotForm } from "~/features/gathering-spots/components/form/GatheringSpotForm";
import { GatheringSpotTable } from "~/features/gathering-spots/components/list/GatheringSpotTable";
import { useGatheringSpotsPage } from "~/features/gathering-spots/hooks/useGatheringSpotsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

type GatheringSpotsPageProps = {
  gateway: GatheringSpotGateway;
};

export function GatheringSpotsPage({ gateway }: GatheringSpotsPageProps) {
  const state = useGatheringSpotsPage({ gateway });

  return (
    <PageLayout
      right={
        state.isFormOpen ? (
          <ScrollbarArea className="h-full overscroll-y-contain">
            <div className="w-[min(24rem,90vw)] p-5 md:p-6">
              <GatheringSpotForm
                editingSpot={state.editingSpot}
                isSubmitting={state.isSubmitting}
                name={state.spotNameInput}
                onChange={state.handleSpotNameChange}
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
                icon={Plus}
                onClick={state.openCreateForm}
                size="lg"
                variant="primary"
              >
                新規登録
              </Button>
            }
            description="集合で使用する場所を管理します"
            title="集合場所管理"
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
              集合場所を読み込み中
            </div>
          ) : null}

          <GatheringSpotTable
            currentPage={state.currentPage}
            isLoading={state.isLoading}
            items={state.sortedSpots}
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
