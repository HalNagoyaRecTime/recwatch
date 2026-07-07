export type NotificationDeliveryStatus = "sent" | "sending" | "failed";

export type NotificationHistoryItem = {
  id: string;
  title: string;
  body: string;
  targetLabel: string;
  relatedResourceLabel: string;
  deliveredAt: string;
  recipientCount: number;
  status: NotificationDeliveryStatus;
};

export const notificationHistoryItems = [
  {
    id: "notification-001",
    title: "サッカー A グループ集合",
    body: "サッカー A グループは10:00にグラウンドへ集合してください。",
    targetLabel: "サッカー A グループ",
    relatedResourceLabel: "サッカー集合 / 10:00 グラウンド",
    deliveredAt: "2026-07-07 09:45",
    recipientCount: 14,
    status: "sent",
  },
  {
    id: "notification-002",
    title: "開会式の案内",
    body: "全体開会式を09:00から体育館で行います。",
    targetLabel: "全体",
    relatedResourceLabel: "開会式 / 09:00 体育館",
    deliveredAt: "2026-07-07 08:30",
    recipientCount: 420,
    status: "sent",
  },
  {
    id: "notification-003",
    title: "リレー担当者連絡",
    body: "リレー担当者は運営本部で進行確認をお願いします。",
    targetLabel: "リレー担当者",
    relatedResourceLabel: "リレー",
    deliveredAt: "2026-07-07 10:10",
    recipientCount: 5,
    status: "sending",
  },
] satisfies NotificationHistoryItem[];
