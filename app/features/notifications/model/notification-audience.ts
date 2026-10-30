import { NOTIFICATION_AUDIENCE_TYPES } from "~/features/notifications/model/notification-values";
export const notificationAudienceTypes = NOTIFICATION_AUDIENCE_TYPES;

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

/** 同じユーザーを統合し、生徒・先生の両方に所属する情報を保持する。 */
export function mergeNotificationUserAudiences(
  users: readonly NotificationAudienceOption[]
) {
  const usersById = new Map<string, NotificationAudienceOption>();
  for (const user of users) {
    const existing = usersById.get(user.id);
    usersById.set(
      user.id,
      existing
        ? {
            ...existing,
            userCategory:
              existing.userCategory === user.userCategory
                ? existing.userCategory
                : "student_and_teacher",
          }
        : user
    );
  }
  return [...usersById.values()];
}

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
