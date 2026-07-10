import {
  getTargetCandidates,
  getTargetOption,
  notificationTargetOptions,
  type NotificationTargetType,
} from "~/features/notifications/model/notification-target";

type NotificationTargetSelectorProps = {
  selectedTargetIds: string[];
  selectedTargetType: NotificationTargetType;
  onTargetIdsChange: (targetIds: string[]) => void;
  onTargetTypeChange: (targetType: NotificationTargetType) => void;
};

export function NotificationTargetSelector({
  selectedTargetIds,
  selectedTargetType,
  onTargetIdsChange,
  onTargetTypeChange,
}: NotificationTargetSelectorProps) {
  const selectedOption = getTargetOption(selectedTargetType);
  const candidates = getTargetCandidates(selectedTargetType);

  const toggleTargetId = (targetId: string) => {
    if (selectedTargetIds.includes(targetId)) {
      onTargetIdsChange(selectedTargetIds.filter((id) => id !== targetId));
      return;
    }

    onTargetIdsChange([...selectedTargetIds, targetId]);
  };

  return (
    <section className="rounded-[18px] border border-[color:var(--border-1)] bg-[linear-gradient(180deg,var(--surface-card-gloss),transparent),var(--surface-1)] p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-base font-semibold text-[color:var(--text-1)]">
          通知対象
        </h2>
        <p className="mt-1 text-sm leading-6 text-[color:var(--text-2)]">
          MVPでは個人検索を行わず、全体またはグループ・チーム単位で配信対象を選択します。
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {notificationTargetOptions.map((option) => {
          const isSelected = option.type === selectedTargetType;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                onTargetTypeChange(option.type);
                onTargetIdsChange([]);
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

      {selectedTargetType === "group" ? (
        <fieldset className="mt-5">
          <legend className="text-xs font-semibold tracking-[0.08em] text-[color:var(--text-3)] uppercase">
            {selectedOption?.label}の選択
          </legend>
          <div className="mt-2 grid gap-2">
            {candidates.map((candidate) => (
              <label
                key={candidate.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--surface-row)] px-3 py-3 transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)]"
              >
                <input
                  type="checkbox"
                  checked={selectedTargetIds.includes(candidate.id)}
                  onChange={() => toggleTargetId(candidate.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-[color:var(--text-1)]">
                    {candidate.label}（{candidate.recipientCount}件）
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[color:var(--text-2)]">
                    {candidate.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}
