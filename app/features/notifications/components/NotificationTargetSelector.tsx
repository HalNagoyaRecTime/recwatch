import {
  getTargetCandidates,
  getTargetOption,
  notificationTargetOptions,
  type NotificationTargetType,
} from "~/features/notifications/model/notification-target";

type NotificationTargetSelectorProps = {
  selectedTargetId: string;
  selectedTargetType: NotificationTargetType;
  onTargetIdChange: (targetId: string) => void;
  onTargetTypeChange: (targetType: NotificationTargetType) => void;
};

export function NotificationTargetSelector({
  selectedTargetId,
  selectedTargetType,
  onTargetIdChange,
  onTargetTypeChange,
}: NotificationTargetSelectorProps) {
  const selectedOption = getTargetOption(selectedTargetType);
  const candidates = getTargetCandidates(selectedTargetType);

  return (
    <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-base font-semibold text-[color:var(--text-1)]">
          通知対象
        </h2>
        <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
          個人単位ではなく、運営で扱いやすい大きな単位で配信対象を選択します。
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notificationTargetOptions.map((option) => {
          const isSelected = option.type === selectedTargetType;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                onTargetTypeChange(option.type);
                onTargetIdChange("");
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-[color:var(--brand-1)] bg-[color:var(--surface-brand-soft)]"
                  : "border-[color:var(--border-1)] bg-[color:var(--surface-row)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)]"
              }`}
            >
              <span className="block text-sm font-semibold text-[color:var(--text-1)]">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[color:var(--text-2)]">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {selectedTargetType !== "all" ? (
        <label className="mt-5 block">
          <span className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            {selectedOption?.label}の選択
          </span>
          <select
            value={selectedTargetId}
            onChange={(event) => onTargetIdChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[color:var(--border-2)] bg-[color:var(--surface-1)] px-3 text-sm text-[color:var(--text-1)] outline-none focus:border-[color:var(--brand-1)] focus:ring-4 focus:ring-[color:var(--surface-brand-soft)]"
          >
            <option value="">対象を選択してください</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label}（{candidate.recipientCount}件）
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </section>
  );
}
