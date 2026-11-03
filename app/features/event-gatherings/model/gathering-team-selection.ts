import type { MemberStudent } from "~/features/event-gatherings/model/gathering-member-candidate";

export type TeamSelection = {
  selectedCount: number;
  totalCount: number;
  userIds: number[];
};

/**
 * チーム選択で新しく追加できる利用中の学生を返す。
 * 停止中の登録済み学生は、既存どおり別枠で個別に解除できるよう対象外にする。
 */
export function getTeamSelection(
  teamId: number,
  students: readonly MemberStudent[],
  selectedUserIds: readonly number[]
): TeamSelection {
  const selected = new Set(selectedUserIds);
  const userIds = Array.from(
    new Set(
      students
        .filter((student) => student.teamId === teamId && student.isLiveActive)
        .map((student) => student.userId)
    )
  );

  return {
    selectedCount: userIds.filter((userId) => selected.has(userId)).length,
    totalCount: userIds.length,
    userIds,
  };
}

/** チーム全体の選択・解除を、他チームの選択を維持したまま反映する。 */
export function updateSelectedTeamMembers(
  selectedUserIds: readonly number[],
  teamUserIds: readonly number[],
  shouldSelect: boolean
): number[] {
  const teamUsers = new Set(teamUserIds);
  if (!shouldSelect) {
    return selectedUserIds.filter((userId) => !teamUsers.has(userId));
  }
  return Array.from(new Set([...selectedUserIds, ...teamUserIds]));
}
