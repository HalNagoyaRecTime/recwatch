export type NotificationTargetType =
  | "all"
  | "class"
  | "event_participants"
  | "event_staff"
  | "participation_group";

export type NotificationTargetOption = {
  type: NotificationTargetType;
  label: string;
  description: string;
};

export type NotificationTargetCandidate = {
  id: string;
  type: Exclude<NotificationTargetType, "all">;
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
    type: "class",
    label: "クラス",
    description: "指定したクラス単位で通知します。",
  },
  {
    type: "event_participants",
    label: "競技参加者",
    description: "指定した競技に出場する参加者へ通知します。",
  },
  {
    type: "event_staff",
    label: "競技担当者",
    description: "指定した競技の担当者へ通知します。",
  },
  {
    type: "participation_group",
    label: "出場グループ",
    description: "集合時間や案内が異なる出場グループ単位で通知します。",
  },
] satisfies NotificationTargetOption[];

export const notificationTargetCandidates = [
  {
    id: "class-1a",
    type: "class",
    label: "1年A組",
    description: "1年A組の生徒・クラス代表者",
    recipientCount: 34,
  },
  {
    id: "class-2b",
    type: "class",
    label: "2年B組",
    description: "2年B組の生徒・クラス代表者",
    recipientCount: 32,
  },
  {
    id: "event-soccer-participants",
    type: "event_participants",
    label: "サッカー参加者",
    description: "サッカーに出場する生徒",
    recipientCount: 28,
  },
  {
    id: "event-relay-participants",
    type: "event_participants",
    label: "リレー参加者",
    description: "リレーに出場する生徒",
    recipientCount: 24,
  },
  {
    id: "event-soccer-staff",
    type: "event_staff",
    label: "サッカー担当者",
    description: "サッカー競技の運営担当",
    recipientCount: 6,
  },
  {
    id: "event-relay-staff",
    type: "event_staff",
    label: "リレー担当者",
    description: "リレー競技の運営担当",
    recipientCount: 5,
  },
  {
    id: "participation-group-soccer-a",
    type: "participation_group",
    label: "サッカー A グループ",
    description: "10:00 集合 / 第1試合出場メンバー",
    recipientCount: 14,
  },
  {
    id: "participation-group-soccer-b",
    type: "participation_group",
    label: "サッカー B グループ",
    description: "10:30 集合 / 第2試合出場メンバー",
    recipientCount: 14,
  },
] satisfies NotificationTargetCandidate[];

export function getTargetOption(type: NotificationTargetType) {
  return notificationTargetOptions.find((option) => option.type === type);
}

export function getTargetCandidates(type: NotificationTargetType) {
  if (type === "all") {
    return [];
  }

  return notificationTargetCandidates.filter(
    (candidate) => candidate.type === type
  );
}
