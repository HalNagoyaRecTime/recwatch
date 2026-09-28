import { isRouteErrorResponse } from "react-router";

import { ApiClientError } from "~/lib/api-client-error";

export function getManagementRouteErrorMessage(error: unknown): string {
  if (
    (error instanceof ApiClientError || isRouteErrorResponse(error)) &&
    error.status === 401
  ) {
    return "認証が必要です。再ログインしてください。";
  }

  if (isRouteErrorResponse(error)) {
    return `エラー${error.status}:${error.data || error.statusText}`;
  }

  if (error instanceof ApiClientError) {
    return `エラー${error.status}:${error.message}`;
  }

  return "予期しないエラーが発生しました。";
}
