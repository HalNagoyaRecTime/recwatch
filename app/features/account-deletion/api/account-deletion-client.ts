import { buildBackendUrl, hasBackendBaseUrl } from "~/config/env";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";
import {
  clearDeletionAuthResult,
  markDeletionAuthPending,
} from "~/features/account-deletion/lib/deletionAuthFlow";

export const accountDeletionUnavailableMessage =
  "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。";

const accountDeletionServerErrorMessage =
  "削除受付サービスでエラーが発生しました。時間をおいてもう一度お試しください。";

const accountDeletionErrorMessages: Record<string, string> = {
  INVALID_REQUEST:
    "削除確認に必要な情報が不足しています。Microsoft 365アカウントで本人確認をやり直してください。",
  DELETION_CONFIRMATION_TOKEN_INVALID:
    "本人確認の有効期限が切れたか、確認情報が無効です。Microsoft 365アカウントで本人確認をやり直してください。",
  ACCOUNT_NOT_FOUND:
    "このMicrosoft 365アカウントに対応するRecTimeアカウントが見つかりません。",
  ACCOUNT_DELETION_NOT_STARTED:
    "アカウント削除の受付を開始できませんでした。本人確認からやり直してください。",
  ACCOUNT_ALREADY_PURGED:
    "このRecTimeアカウントはすでに削除受付済みか、削除処理が完了しています。",
  ACCOUNT_DELETION_PENDING:
    "このRecTimeアカウントは削除処理中または削除済みのため、操作を続けられません。",
  STATE_MISMATCH:
    "本人確認の有効期限が切れました。Microsoft 365アカウントで本人確認をやり直してください。",
  INVALID_STATE_PURPOSE:
    "本人確認の用途を確認できませんでした。削除受付ページからやり直してください。",
  TOKEN_EXCHANGE_FAILED:
    "Microsoftとの本人確認に失敗しました。もう一度お試しください。",
  INVALID_ID_TOKEN:
    "Microsoftとの本人確認に失敗しました。もう一度お試しください。",
  NETWORK_ERROR: accountDeletionUnavailableMessage,
  CONFIG_ERROR: accountDeletionUnavailableMessage,
};

export type AccountDeletionErrorReason =
  | "reauth"
  | "already-deleted"
  | "generic";

export type StartDeletionAuthResult =
  | { ok: true; authUrl: string }
  | { ok: false; message: string };

export type ConfirmDeletionResult =
  | { status: "done" }
  | { status: "accepted" }
  | { status: "pending" }
  | {
      status: "error";
      code?: string;
      message: string;
      reason?: AccountDeletionErrorReason;
    };

type BackendErrorPayload = {
  error: {
    code: string;
  };
};

export function getAccountDeletionErrorMessage(
  code: string | undefined,
  status?: number
): string {
  if (status !== undefined && status >= 500) {
    return accountDeletionServerErrorMessage;
  }

  return (
    (code ? accountDeletionErrorMessages[code] : undefined) ??
    "本人確認または削除受付を完了できませんでした。削除受付ページからやり直してください。"
  );
}

export function getAccountDeletionErrorReason(
  code: string | undefined
): AccountDeletionErrorReason {
  if (
    code === "DELETION_CONFIRMATION_TOKEN_INVALID" ||
    code === "STATE_MISMATCH"
  ) {
    return "reauth";
  }

  if (
    code === "ACCOUNT_ALREADY_PURGED" ||
    code === "ACCOUNT_DELETION_PENDING"
  ) {
    return "already-deleted";
  }

  return "generic";
}

export async function startAccountDeletionAuth(): Promise<StartDeletionAuthResult> {
  if (!hasBackendBaseUrl()) {
    return { ok: false, message: accountDeletionUnavailableMessage };
  }

  const authUrl = buildBackendUrl("/api/v1/auth/microsoft/delete-login");
  if (!authUrl) {
    return { ok: false, message: accountDeletionUnavailableMessage };
  }

  clearDeletionAuthResult();
  markDeletionAuthPending();
  return { ok: true, authUrl };
}

export async function confirmAccountDeletion(
  deletionConfirmationToken: string
): Promise<ConfirmDeletionResult> {
  if (!deletionConfirmationToken) {
    return buildDeletionError("DELETION_CONFIRMATION_TOKEN_INVALID");
  }

  const deleteUrl = buildBackendUrl("/api/v1/auth/me");
  if (!deleteUrl) {
    return buildDeletionError("CONFIG_ERROR");
  }

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      ...WEB_CLIENT_HEADERS,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deletion_confirmation_token: deletionConfirmationToken,
    }),
  }).catch(() => null);

  if (!response) {
    return buildDeletionError("NETWORK_ERROR");
  }

  // 現行APIは202 AcceptedかつレスポンスBodyなしで削除受付を返す。
  // 将来204へ変更された場合も、ブラウザだけで完了扱いにせず受付成功として扱う。
  if (response.status === 202 || response.status === 204) {
    return { status: "done" };
  }

  const payload: unknown = await response.json().catch(() => null);
  const code = getBackendErrorCode(payload) ?? `HTTP_${response.status}`;
  return buildDeletionError(code, response.status);
}

function buildDeletionError(
  code: string,
  status?: number
): ConfirmDeletionResult {
  return {
    status: "error",
    code,
    message: getAccountDeletionErrorMessage(code, status),
    reason: getAccountDeletionErrorReason(code),
  };
}

function getBackendErrorCode(value: unknown): string | undefined {
  if (!isBackendErrorPayload(value)) {
    return undefined;
  }

  return value.error.code;
}

function isBackendErrorPayload(value: unknown): value is BackendErrorPayload {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = value.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}
