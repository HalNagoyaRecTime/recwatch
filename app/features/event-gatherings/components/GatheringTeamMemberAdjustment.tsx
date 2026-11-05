import type { MemberStudent } from "~/features/event-gatherings/model/gathering-member-candidate";
import { MAX_GATHERING_MEMBERS } from "~/features/event-gatherings/model/event-gathering-settings";

export type SelectedTeamMemberGroup = {
  id: number;
  name: string;
  students: readonly MemberStudent[];
};

type GatheringTeamMemberAdjustmentProps = {
  groups: readonly SelectedTeamMemberGroup[];
  onToggle: (userId: number) => void;
  selectedUserIds: readonly number[];
};

/** 選択したチームの参加者を、保存上限に合わせて個別に調整する。 */
export function GatheringTeamMemberAdjustment({
  groups,
  onToggle,
  selectedUserIds,
}: GatheringTeamMemberAdjustmentProps) {
  if (groups.length === 0) return null;

  const selected = new Set(selectedUserIds);

  return (
    <section
      aria-label="選択したチームの参加者調整"
      className="border-border-base app-rounded space-y-3 border p-3"
    >
      <div>
        <h4 className="text-text-base text-sm font-semibold">選択人数を調整</h4>
        <p className="text-text-muted mt-1 text-xs">
          保存する学生のチェックを外すと、{MAX_GATHERING_MEMBERS}
          人以内に調整できます。
        </p>
      </div>

      <div className="max-h-52 space-y-3 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="text-text-base mb-1 text-sm font-medium">
              {group.name}
            </p>
            <ul className="space-y-1">
              {group.students.map((student) => (
                <li
                  className="bg-surface-muted app-rounded flex items-center gap-2 px-2 py-1.5"
                  key={student.userId}
                >
                  <input
                    aria-label={`${student.name}（${student.studentNumber}）を参加者に含める`}
                    checked={selected.has(student.userId)}
                    className="accent-brand-primary size-4"
                    onChange={() => onToggle(student.userId)}
                    type="checkbox"
                  />
                  <span className="text-text-base text-sm">{student.name}</span>
                  <span className="text-text-muted ml-auto text-xs">
                    {student.studentNumber}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
