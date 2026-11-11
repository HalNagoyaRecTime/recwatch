import type { ManagementOptionState } from "~/hooks/useManagementOptions";

type ManagementOptionFeedbackProps = {
  label: string;
  state: Pick<ManagementOptionState<unknown>, "error" | "isLoading">;
};

export function ManagementOptionFeedback({
  label,
  state,
}: ManagementOptionFeedbackProps) {
  if (state.isLoading) {
    return (
      <p className="text-text-muted text-sm" role="status">
        {label}を読み込んでいます...
      </p>
    );
  }

  if (state.error) {
    return (
      <p className="text-tone-danger-text text-sm" role="alert">
        {state.error}
      </p>
    );
  }

  return null;
}
