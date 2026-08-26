export type NavigationSearchResult = {
  id: string;
  title: string;
  category: string;
  to: string;
  keywords: readonly string[];
};

export const NAVIGATION_SEARCH_RESULTS: readonly NavigationSearchResult[] = [
  {
    id: "dashboard",
    title: "ダッシュボード",
    category: "ホーム",
    to: "/dashboard",
    keywords: ["home", "トップ"],
  },
  {
    id: "members",
    title: "学生管理",
    category: "管理",
    to: "/members",
    keywords: ["生徒", "メンバー", "CSV", "名簿"],
  },
  {
    id: "classrooms",
    title: "クラス管理",
    category: "管理",
    to: "/classroom",
    keywords: ["教室", "クラス"],
  },
  {
    id: "teachers",
    title: "教官管理",
    category: "管理",
    to: "/teachers",
    keywords: ["先生", "教官", "新規登録"],
  },
  {
    id: "events",
    title: "イベント登録一覧",
    category: "イベント",
    to: "/events",
    keywords: ["イベント", "種目"],
  },
  {
    id: "events-new",
    title: "イベントの新規登録",
    category: "イベント",
    to: "/events/new",
    keywords: ["イベント", "作成", "追加"],
  },
  {
    id: "event-assignments",
    title: "参加者設定",
    category: "イベント",
    to: "/events/assignments",
    keywords: ["教官", "担当", "割当"],
  },
  {
    id: "gathering-spots",
    title: "集合場所管理",
    category: "イベント",
    to: "/gathering-spots",
    keywords: ["集合", "場所"],
  },
  {
    id: "schedule",
    title: "スケジュール管理",
    category: "運用",
    to: "/schedule",
    keywords: ["日程", "予定"],
  },
  {
    id: "schedule-new",
    title: "スケジュールの新規登録",
    category: "運用",
    to: "/schedule/new",
    keywords: ["日程", "予定", "追加"],
  },
  {
    id: "participants",
    title: "出場メンバー管理",
    category: "運用",
    to: "/participants",
    keywords: ["参加者", "選手", "割り当て"],
  },
  {
    id: "notifications",
    title: "通知管理",
    category: "通知",
    to: "/notifications",
    keywords: ["お知らせ", "履歴"],
  },
  {
    id: "notifications-new",
    title: "通知の新規登録",
    category: "通知",
    to: "/notifications/new",
    keywords: ["お知らせ", "配信", "送信"],
  },
];

export function filterNavigationSearchResults(
  query: string
): readonly NavigationSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja");

  if (!normalizedQuery) {
    return NAVIGATION_SEARCH_RESULTS;
  }

  return NAVIGATION_SEARCH_RESULTS.filter((result) =>
    [result.title, result.category, ...result.keywords].some((value) =>
      value.toLocaleLowerCase("ja").includes(normalizedQuery)
    )
  );
}
