import { ApiClientError } from "./api-client-error";

export const UPDATE_CONFLICT_MESSAGE =
  "他の人がこの内容を変更しました。最新の内容を読み込みます。";

/** 更新時の楽観ロックで、取得後に他の操作で変更されていた場合のエラーかを判定する。 */
export function isUpdateConflictError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 409;
}
