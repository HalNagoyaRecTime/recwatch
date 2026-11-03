import { describe, expect, it } from "vitest";

import {
  getTeamSelection,
  updateSelectedTeamMembers,
} from "~/features/event-gatherings/model/gathering-team-selection";
import type { MemberStudent } from "~/features/event-gatherings/model/gathering-member-candidate";

const students: MemberStudent[] = [
  {
    id: 1,
    userId: 101,
    name: "山田 太郎",
    teamId: 10,
    classroomId: 1,
    attendanceNumber: 1,
    studentNumber: "2026001",
    isLiveActive: true,
  },
  {
    id: 2,
    userId: 102,
    name: "佐藤 花子",
    teamId: 10,
    classroomId: 2,
    attendanceNumber: 1,
    studentNumber: "2026002",
    isLiveActive: true,
  },
  {
    id: 3,
    userId: 103,
    name: "停止中の学生",
    teamId: 10,
    classroomId: 2,
    attendanceNumber: 2,
    studentNumber: "2026003",
    isLiveActive: false,
  },
];

describe("getTeamSelection", () => {
  it("複数クラスの学生をチーム単位でまとめ、停止中の未登録者を除く", () => {
    expect(getTeamSelection(10, students, [101])).toEqual({
      selectedCount: 1,
      totalCount: 2,
      userIds: [101, 102],
    });
  });

  it("登録済みでも停止中の学生はチーム選択の対象に含めない", () => {
    expect(getTeamSelection(10, students, [103])).toEqual({
      selectedCount: 0,
      totalCount: 2,
      userIds: [101, 102],
    });
  });
});

describe("updateSelectedTeamMembers", () => {
  it("チーム全員を重複させずに追加し、他の参加者を維持する", () => {
    expect(updateSelectedTeamMembers([101, 900], [101, 102], true)).toEqual([
      101, 900, 102,
    ]);
  });

  it("対象チームの参加者だけを解除する", () => {
    expect(
      updateSelectedTeamMembers([101, 102, 900], [101, 102], false)
    ).toEqual([900]);
  });
});
