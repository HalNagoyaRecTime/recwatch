import { ApiClientError } from "~/lib/api-client-error";

export const notificationV2ErrorFixtures = {
  validation: new ApiClientError(
    400,
    "入力内容を確認してください",
    "VALIDATION_ERROR",
    {
      fieldErrors: {
        "content.push.title": ["必須です"],
      },
      formErrors: [],
    }
  ),
  forbidden: new ApiClientError(
    403,
    "この重要度は利用できません",
    "NOTIFICATION_IMPORTANCE_FORBIDDEN"
  ),
  notFound: new ApiClientError(
    404,
    "通知が見つかりません",
    "ADMIN_NOTIFICATION_NOT_FOUND"
  ),
  conflict: new ApiClientError(
    409,
    "通知を編集できません",
    "NOTIFICATION_EDIT_NOT_ALLOWED"
  ),
  internalServerError: new ApiClientError(
    500,
    "処理に失敗しました",
    "INTERNAL_SERVER_ERROR"
  ),
} as const;
