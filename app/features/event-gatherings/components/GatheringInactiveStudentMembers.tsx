import type { MemberStudent } from "~/features/event-gatherings/model/gathering-member-candidate";

type GatheringInactiveStudentMembersProps = {
  /** ピッカーを開いた時点で登録済みだった停止中の学生。 */
  members: readonly MemberStudent[];
  onToggle: (userId: number) => void;
  selectedUserIds: readonly number[];
};

/** 停止中の登録済み学生を、選択候補とは別枠で解除・付け直しできるようにする。 */
export function GatheringInactiveStudentMembers({
  members,
  onToggle,
  selectedUserIds,
}: GatheringInactiveStudentMembersProps) {
  if (members.length === 0) return null;

  return (
    <section aria-label="登録済みの停止中学生" className="space-y-2 text-sm">
      <p className="text-text-base font-semibold">登録済みの停止中学生</p>
      <p className="text-text-muted">
        チェックを外すと登録を解除できます。一括選択・検索・クラス絞り込みの対象外です。
      </p>
      <div className="max-h-64 overflow-x-hidden overflow-y-auto">
        <table
          aria-label="登録済みの停止中学生一覧"
          className="border-border-base bg-surface-base app-rounded w-full table-fixed border"
        >
          <thead className="text-text-muted">
            <tr className="border-border-subtle border-b">
              <th className="w-14 py-2.5 text-center font-normal" scope="col">
                選択
              </th>
              <th className="px-3 py-2.5 text-left font-normal" scope="col">
                氏名
              </th>
              <th
                className="w-36 px-3 py-2.5 text-left font-normal"
                scope="col"
              >
                学籍番号
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.userId}
                className="border-border-subtle border-b last:border-b-0"
              >
                <td className="py-2 text-center">
                  <input
                    aria-label={`${member.name}を選択`}
                    checked={selectedUserIds.includes(member.userId)}
                    className="accent-brand-primary size-4 align-middle"
                    onChange={() => onToggle(member.userId)}
                    type="checkbox"
                  />
                </td>
                <td className="text-text-base truncate px-3 py-2 font-semibold">
                  {member.name}
                </td>
                <td className="text-text-base truncate px-3 py-2">
                  {member.studentNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
