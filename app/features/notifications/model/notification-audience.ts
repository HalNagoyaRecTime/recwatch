export const notificationAudienceTypes = [
  "all",
  "class_room",
  "gathering",
  "event",
  "user",
] as const;

export type NotificationAudienceType =
  (typeof notificationAudienceTypes)[number];

export type NotificationAudienceScopeType = Exclude<
  NotificationAudienceType,
  "all"
>;

export type NotificationAudienceOption = {
  id: string;
  name: string;
  userCategory?: "student" | "teacher" | "student_and_teacher";
  type: NotificationAudienceScopeType;
};

export type NotificationAudienceSearchInput = {
  options: NotificationAudienceOption[];
  scope: NotificationAudienceScopeType;
  query: string;
  selectedKeys: ReadonlySet<string>;
  limit: number;
};

/** 対象種別・検索クエリ・選択済み除外で対象候補を絞り込む */
export function searchNotificationAudienceOptions({
  options,
  scope,
  query,
  selectedKeys,
  limit,
}: NotificationAudienceSearchInput): NotificationAudienceOption[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");
  if (!normalizedQuery) return [];

  return options
    .filter(
      (option) =>
        option.type === scope &&
        !selectedKeys.has(`${option.type}:${option.id}`) &&
        `${option.name} ${option.id}`
          .toLocaleLowerCase("ja-JP")
          .includes(normalizedQuery)
    )
    .slice(0, limit);
}
