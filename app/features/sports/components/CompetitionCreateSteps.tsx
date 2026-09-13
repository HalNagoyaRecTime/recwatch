import { cn } from "~/lib/cn";

export type CompetitionCreateStepId = "event" | "gatherings";

const steps: readonly { id: CompetitionCreateStepId; label: string }[] = [
  { id: "event", label: "イベント" },
  { id: "gatherings", label: "集合設定" },
];

type CompetitionCreateStepsProps = {
  current: CompetitionCreateStepId;
};

/** 新規作成モーダルの進行状況。イベント本体の作成と集合設定の 2 段階を示す。 */
export function CompetitionCreateSteps({
  current,
}: CompetitionCreateStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol aria-label="作成の手順" className="grid gap-3 sm:grid-cols-2">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li
            key={step.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "app-rounded flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium",
              isCurrent
                ? "bg-brand-primary/10 text-brand-primary"
                : isDone
                  ? "bg-tone-success-bg text-tone-success-text"
                  : "bg-surface-muted text-text-muted"
            )}
          >
            <span
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                isCurrent
                  ? "bg-brand-primary text-text-base-inverse"
                  : isDone
                    ? "bg-tone-success-text text-text-base-inverse"
                    : "bg-surface-base text-text-muted"
              )}
            >
              {index + 1}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
