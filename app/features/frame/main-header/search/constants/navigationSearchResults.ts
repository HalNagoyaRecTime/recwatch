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
    id: "students",
    title: "学生管理",
    category: "管理",
    to: "/students",
    keywords: ["学生", "Student", "CSV", "名簿", "学籍番号"],
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
    id: "gathering-spots",
    title: "集合場所管理",
    category: "イベント",
    to: "/gathering-spots",
    keywords: ["集合", "場所"],
  },
  {
    id: "venues",
    title: "実施場所管理",
    category: "イベント",
    to: "/venues",
    keywords: ["実施", "場所", "会場"],
  },
  {
    id: "notifications",
    title: "通知一覧",
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
