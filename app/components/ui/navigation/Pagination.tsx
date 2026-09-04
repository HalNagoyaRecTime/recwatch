import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Select } from "~/components/ui/form/Select";

type PaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageCount: number;
  pageSize: number;
  totalItems: number;
};

export function Pagination({
  currentPage,
  onPageChange,
  pageCount,
  pageSize,
  totalItems,
}: PaginationProps) {
  const firstItemIndex = (currentPage - 1) * pageSize + 1;
  const lastItemIndex = Math.min(currentPage * pageSize, totalItems);
  const displayedItemCount = lastItemIndex - firstItemIndex + 1;
  const pageOptions = Array.from({ length: pageCount }, (_, index) => ({
    label: String(index + 1),
    value: String(index + 1),
  }));

  return (
    <nav
      aria-label="ページネーション"
      className="flex items-center justify-between gap-4"
    >
      <div className="text-text-muted flex items-center text-sm">
        <p>
          {displayedItemCount}件を表示&nbsp; {firstItemIndex}〜{lastItemIndex}
          件中 全{totalItems}件
        </p>
        <p className="border-border-base ml-5 border-l pl-5">
          ページ {currentPage} / {pageCount}
        </p>
      </div>

      <div className="app-rounded border-border-base bg-surface-base flex overflow-visible border">
        <PageButton
          disabled={currentPage === 1}
          label="最初のページ"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft aria-hidden="true" className="size-4" />
        </PageButton>
        <PageButton
          disabled={currentPage === 1}
          label="前のページ"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </PageButton>
        <div className="border-border-base border-x">
          <Select
            ariaLabel="ページ番号を選択"
            onValueChange={(value) => onPageChange(Number(value))}
            options={pageOptions}
            variant="grouped"
            value={String(currentPage)}
          />
        </div>
        <PageButton
          disabled={currentPage === pageCount}
          label="次のページ"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </PageButton>
        <PageButton
          disabled={currentPage === pageCount}
          label="最後のページ"
          onClick={() => onPageChange(pageCount)}
        >
          <ChevronsRight aria-hidden="true" className="size-4" />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: import("react").ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="border-border-base text-text-muted hover:bg-surface-hover hover:text-text-base disabled:hover:text-text-muted flex size-9 cursor-pointer items-center justify-center transition-colors disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
