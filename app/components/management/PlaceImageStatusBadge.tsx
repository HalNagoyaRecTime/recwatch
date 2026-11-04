import { Check } from "lucide-react";

import { cn } from "~/lib/cn";

type PlaceImageStatusBadgeProps = {
  disabled?: boolean;
  imageUrl: string | null;
  label: string;
  onClick: () => void;
};

export function PlaceImageStatusBadge({
  disabled = false,
  imageUrl,
  label,
  onClick,
}: PlaceImageStatusBadgeProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-default disabled:opacity-50",
        imageUrl
          ? "bg-tone-success-bg text-tone-success-text hover:brightness-95"
          : "bg-surface-muted text-text-muted hover:bg-surface-hover hover:text-text-base"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="sr-only">{label}：</span>
      {imageUrl ? (
        <>
          <Check aria-hidden="true" className="size-3.5" />
          登録済み
        </>
      ) : (
        "未登録"
      )}
    </button>
  );
}
