import { CalendarDays, Trophy, UsersRound } from "lucide-react";

import {
  DashboardNavigationCard,
  type DashboardNavigationItem,
} from "./DashboardNavigationCard";

type NavigationGroup = {
  icon: typeof UsersRound;
  id: string;
  items: DashboardNavigationItem[];
  title: string;
};

const navigationGroups: NavigationGroup[] = [
  {
    icon: UsersRound,
    id: "users",
    items: [
      { label: "学生管理", to: "/members" },
      { label: "クラス管理", to: "/classroom" },
      { label: "教官管理", to: "/teachers" },
    ],
    title: "ユーザー管理",
  },
  {
    icon: Trophy,
    id: "events",
    items: [
      { label: "イベント登録一覧", to: "/events" },
      { label: "参加者設定", to: "/events/assignments" },
      { label: "集合場所管理", to: "/gathering-spots" },
    ],
    title: "イベント管理",
  },
  {
    icon: CalendarDays,
    id: "operations",
    items: [
      { label: "スケジュール管理", to: "/schedule" },
      { label: "出場メンバー管理", to: "/participants" },
      { label: "通知管理", to: "/notifications" },
    ],
    title: "運用管理",
  },
];

export function DashboardNavigationGrid() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-5">
      {navigationGroups.map((group) => (
        <div
          key={group.id}
          className="w-full md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.875rem)]"
        >
          <DashboardNavigationCard {...group} />
        </div>
      ))}
    </div>
  );
}
