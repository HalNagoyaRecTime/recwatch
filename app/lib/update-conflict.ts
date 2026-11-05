import { ApiClientError } from "./api-client-error";

export const UPDATE_CONFLICT_MESSAGE =
  "他の人がこの内容を変更しました。最新の内容を読み込みます。";

// 同じ PUT から重複エラーなど別の 409 も返るため、status ではなく code で判定する。
const UPDATE_CONFLICT_CODES: ReadonlySet<string> = new Set([
  "CLASS_ROOM_UPDATE_CONFLICT",
  "EVENT_UPDATE_CONFLICT",
  "GATHERING_SPOT_UPDATE_CONFLICT",
  "STUDENT_UPDATE_CONFLICT",
  "TEACHER_UPDATE_CONFLICT",
  "VENUE_UPDATE_CONFLICT",
]);

/** 更新時の楽観ロックで、取得後に他の操作で変更されていた場合のエラーかを判定する。 */
export function isUpdateConflictError(error: unknown): boolean {
  return (
    error instanceof ApiClientError && UPDATE_CONFLICT_CODES.has(error.code)
  );
}
