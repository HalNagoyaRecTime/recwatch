import type { MemberNonStudent } from "~/features/events/model/gathering-member-candidate";

type GatheringNonStudentMembersProps = {
  /** 候補の表に行が無く、氏名が分かった登録済みの参加者。 */
  members: readonly MemberNonStudent[];
  onToggle: (userId: number) => void;
  selectedUserIds: readonly number[];
  /** 候補の表に行が無く、氏名も分からない登録済みの参加者の人数。 */
  unnamedCount: number;
};

/**
 * 学生以外の登録済み参加者を、候補の表とは別枠で表示する。
 * 表の絞り込み・検索の対象にできないため表には混ぜず、行の見た目だけ表に揃える。
 */
export function GatheringNonStudentMembers({
  members,
  onToggle,
  selectedUserIds,
  unnamedCount,
}: GatheringNonStudentMembersProps) {
  if (members.length === 0 && unnamedCount === 0) return null;

  return (
    <section aria-label="学生以外の参加者" className="space-y-2 text-sm">
      <p className="text-text-muted">
        学生以外の参加者（クラスでの絞り込み・検索の対象外）
      </p>
      {members.length > 0 ? (
        <table
          aria-label="学生以外の参加者一覧"
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
                  {member.isLiveActive ? null : (
                    <span className="app-rounded bg-surface-muted text-text-muted ml-2 px-1.5 py-0.5 text-xs font-medium">
                      停止中
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {/* 誰を外すのか分からないまま操作させないため、氏名の無い参加者は件数だけ出す */}
      {unnamedCount > 0 ? (
        <p className="text-text-muted">
          氏名を確認できない参加者が{unnamedCount}
          人います。この画面では外せないため、登録されたまま保存されます。
        </p>
      ) : null}
    </section>
  );
}
