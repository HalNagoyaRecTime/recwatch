import type { NotificationListItem } from "~/features/notifications/model/notification-list";
import type {
  NotificationAudienceOption,
  NotificationTargetType,
  NotificationTargetOption,
} from "~/features/notifications/model/notification-audience";

export type NotificationDesignTargetMember = {
  fcmToken?: string;
  id: string;
  name: string;
};

export type NotificationDesignTargetGroup = {
  count: number;
  id: string;
  members: readonly NotificationDesignTargetMember[];
  name: string;
  type: NotificationTargetType;
};

export type NotificationDesignDetail = {
  createdAt: string;
  createdBy: string;
  deliveryMode: "automatic" | "manual";
  deliveredRecipientCount?: number;
  failedRecipientCount?: number;
  markdownDescription: string;
  pushBody: string;
  pushTitle: string;
  scheduledAt: string;
  status: "draft" | "sending" | "sent" | "failed";
  targetGroups: readonly NotificationDesignTargetGroup[];
  title: string;
  confirmedRecipientCount?: number;
  plannedRecipientCount: number;
};

/** 通知画面のデザイン確認に使用する固定データ。API接続時に置き換える。 */
export const notificationDesignListItems: readonly NotificationListItem[] = [
  {
    id: "101",
    title: "競技開始時間の変更",
    audience: "競技参加者 30名",
    deliveredAt: "11/07 09:05",
    sender: "HAL 太郎",
    competition: "走れ！〇人〇脚！",
    schedule: "11/07 09:00",
    status: "draft",
    canModify: true,
  },
  {
    id: "102",
    title: "集合場所のお知らせ",
    audience: "配信対象者 28名",
    deliveredAt: "11/07 10:10",
    sender: "HAL 太郎",
    competition: "—",
    schedule: "11/07 10:10",
    status: "sending",
    canModify: false,
  },
  {
    id: "103",
    title: "緊急連絡",
    audience: "配信対象者 120名",
    deliveredAt: "11/07 13:20",
    sender: "HAL 太郎",
    competition: "—",
    schedule: "11/07 13:20",
    status: "sent",
    canModify: false,
  },
  {
    id: "104",
    title: "紙飛行機飛ばし",
    audience: "競技参加者 24名",
    deliveredAt: "11/07 13:20",
    sender: "HAL 太郎",
    competition: "紙飛行機飛ばし",
    schedule: "11/07 13:20",
    status: "failed",
    canModify: false,
  },
];

export const notificationDesignAudienceOptions: readonly NotificationAudienceOption[] =
  [
    { id: "1", name: "1年A組", type: "class_room" },
    { id: "2", name: "1年B組", type: "class_room" },
    { id: "1", name: "Aグループ", type: "gathering" },
    { id: "2", name: "Bグループ", type: "gathering" },
    { id: "1", name: "走れ！〇人〇脚！", type: "event_participants" },
    { id: "2", name: "ガチンコ綱引き", type: "event_participants" },
  ];

export const notificationDesignTargetOptions: readonly NotificationTargetOption[] =
  [
    {
      coveredByIds: ["class-2-1", "team-red"],
      detail: "2年1組",
      id: "person-yamada-taro",
      name: "山田 太郎",
      recipientCount: 1,
      type: "person",
    },
    {
      detail: "32人",
      id: "class-2-1",
      name: "2年1組",
      recipientCount: 32,
      type: "class",
    },
    {
      detail: "124人",
      id: "team-red",
      name: "赤チーム",
      recipientCount: 124,
      type: "team",
    },
  ];

export const notificationDesignDetail: NotificationDesignDetail = {
  confirmedRecipientCount: 156,
  createdAt: "2026-11-07T14:20",
  createdBy: "HAL 太郎",
  deliveryMode: "manual",
  deliveredRecipientCount: 152,
  failedRecipientCount: 4,
  markdownDescription:
    "# 集合時間のお知らせ\n\n明日の集合時間が変更になりました。\n\n- 集合場所：Aコート前\n- 集合時間：08:45\n\n**時間に余裕を持って集合してください。**",
  plannedRecipientCount: 156,
  pushBody: "明日の集合時間が変更になりました。",
  pushTitle: "集合時間の変更",
  scheduledAt: "2026-11-07T15:35",
  status: "draft",
  targetGroups: [
    {
      count: 2,
      id: "individuals",
      members: [
        {
          fcmToken: "fcm_demo_yamada_taro",
          id: "user-001",
          name: "山田 太郎",
        },
        {
          fcmToken: "fcm_demo_sato_hanako",
          id: "user-002",
          name: "佐藤 花子",
        },
      ],
      name: "個人",
      type: "person",
    },
    {
      count: 32,
      id: "class-2-1",
      members: [
        {
          fcmToken: "fcm_demo_yamada_taro",
          id: "user-001",
          name: "山田 太郎",
        },
      ],
      name: "2年1組",
      type: "class",
    },
    {
      count: 124,
      id: "team-red",
      members: [],
      name: "赤チーム",
      type: "team",
    },
    {
      count: 8,
      id: "gathering-a-court",
      members: [],
      name: "Aコート集合予定メンバー",
      type: "gathering",
    },
  ],
  title: "走れ！〇人〇脚！集合時間のお知らせ",
};
