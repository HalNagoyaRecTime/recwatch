export type NotificationTargetType = "all" | "group";

export type NotificationTargetOption = {
  type: NotificationTargetType;
  label: string;
  description: string;
};

export type NotificationTargetCandidate = {
  id: string;
  label: string;
  description: string;
  recipientCount: number;
};

export const notificationTargetOptions = [
  {
    type: "all",
    label: "全体",
    description: "生徒・関係者全体へ一斉に通知します。",
  },
  {
    type: "group",
    label: "グループ・チーム",
    description: "クラスやチームなどの大きな単位で通知します。",
  },
] satisfies NotificationTargetOption[];

export const notificationTargetCandidates = [
  {
    id: "class-1a",
    label: "1年A組",
    description: "1年A組の生徒・クラス代表者",
    recipientCount: 34,
  },
  {
    id: "class-2b",
    label: "2年B組",
    description: "2年B組の生徒・クラス代表者",
    recipientCount: 32,
  },
  {
    id: "team-red",
    label: "赤チーム",
    description: "赤チームに所属する参加者",
    recipientCount: 28,
  },
  {
    id: "team-blue",
    label: "青チーム",
    description: "青チームに所属する参加者",
    recipientCount: 24,
  },
] satisfies NotificationTargetCandidate[];

export function getTargetOption(type: NotificationTargetType) {
  return notificationTargetOptions.find((option) => option.type === type);
}

export function getTargetCandidates(type: NotificationTargetType) {
  if (type === "all") {
    return [];
  }

  return notificationTargetCandidates;
}
