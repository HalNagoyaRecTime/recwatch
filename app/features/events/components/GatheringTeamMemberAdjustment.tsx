import type { MemberStudent } from "~/features/events/model/gathering-member-candidate";

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

/** 選択したチームのうち、参加させない学生を個別に外す。 */
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
        <h4 className="text-text-base text-sm font-semibold">
          参加者を個別に外す
        </h4>
        <p className="text-text-muted mt-1 text-xs">
          チェックを外した学生は参加者に含めません。
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
