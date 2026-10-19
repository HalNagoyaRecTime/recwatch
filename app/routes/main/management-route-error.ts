import { isRouteErrorResponse } from "react-router";

import { ApiClientError } from "~/lib/api-client-error";

export function getManagementRouteErrorMessage(error: unknown): string {
  if (
    (error instanceof ApiClientError ||
      isManagementRouteErrorResponse(error)) &&
    error.status === 401
  ) {
    return "認証が必要です。再ログインしてください。";
  }

  if (isManagementRouteErrorResponse(error)) {
    return `エラー${error.status}:${error.data || error.statusText}`;
  }

  if (error instanceof ApiClientError) {
    return `エラー${error.status}:${error.message}`;
  }

  return "予期しないエラーが発生しました。";
}

function isManagementRouteErrorResponse(
  error: unknown
): error is { data: unknown; status: number; statusText: string } {
  if (isRouteErrorResponse(error)) return true;
  if (typeof error !== "object" || error === null) return false;
  if (!("status" in error) || typeof error.status !== "number") return false;
  return "data" in error || "statusText" in error;
}
