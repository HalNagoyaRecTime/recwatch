export type NotificationDeliveryStatus = "sent" | "sending" | "failed";

export type NotificationHistoryItem = {
  id: string;
  title: string;
  body: string;
  targetLabel: string;
  deliveredAt: string;
  recipientCount: number;
  status: NotificationDeliveryStatus;
};

export const notificationHistoryItems = [
  {
    id: "notification-001",
    title: "集合場所の案内",
    body: "赤チームは体育館前に集合してください。",
    targetLabel: "赤チーム",
    deliveredAt: "2026-07-07 09:45",
    recipientCount: 28,
    status: "sent",
  },
  {
    id: "notification-002",
    title: "開会式の案内",
    body: "全体開会式を09:00から体育館で行います。",
    targetLabel: "全体",
    deliveredAt: "2026-07-07 08:30",
    recipientCount: 420,
    status: "sent",
  },
  {
    id: "notification-003",
    title: "持ち物確認",
    body: "青チームはタオルと飲み物を持って集合してください。",
    targetLabel: "青チーム",
    deliveredAt: "2026-07-07 10:10",
    recipientCount: 24,
    status: "sending",
  },
] satisfies NotificationHistoryItem[];
