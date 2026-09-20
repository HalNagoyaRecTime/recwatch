import { buildBackendUrl, hasBackendBaseUrl } from "~/config/env";
import { WEB_CLIENT_HEADERS } from "~/lib/web-client-headers";
import type {
  AccountDeletionErrorReason,
  AccountDeletionGateway,
  ConfirmDeletionResult,
  StartDeletionAuthResult,
} from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import {
  clearDeletionAuthResult,
  markDeletionAuthPending,
} from "~/features/account-deletion/lib/deletionAuthFlow";

export const accountDeletionUnavailableMessage =
  "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。";

const accountDeletionServerErrorMessage =
  "削除受付サービスでエラーが発生しました。時間をおいてもう一度お試しください。";

const deletionAuthFailedMessage =
  "Microsoft アカウントで認証できませんでした。";

const accountDeletionErrorMessages: Record<string, string> = {
  INVALID_REQUEST:
    "削除確認に必要な情報が不足しています。Microsoft アカウントで認証し直してください。",
  DELETION_CONFIRMATION_TOKEN_INVALID:
    "Microsoft アカウントの認証情報が無効か、有効期限が切れている可能性があります。もう一度認証してください。",
  ACCOUNT_NOT_FOUND:
    "このMicrosoft アカウントに対応するアカウントは存在しません。",
  ACCOUNT_ALREADY_PURGED: "削除処理はすでに完了しています。",
  ACCOUNT_DELETION_NOT_STARTED: accountDeletionServerErrorMessage,
  ACCOUNT_DELETION_PENDING: accountDeletionServerErrorMessage,
  STATE_MISMATCH: deletionAuthFailedMessage,
  INVALID_STATE_PURPOSE: deletionAuthFailedMessage,
  TOKEN_EXCHANGE_FAILED: "Microsoft アカウントで認証できませんでした。",
  INVALID_ID_TOKEN: "Microsoft アカウントで認証できませんでした。",
  NETWORK_ERROR: accountDeletionUnavailableMessage,
  CONFIG_ERROR: accountDeletionUnavailableMessage,
};

const deletionAuthRequiredMessage = "Microsoft アカウントで認証してください。";

export function getAccountDeletionInitialErrorMessage(
  error: string | null
): string {
  switch (error) {
    case "auth_required":
      return deletionAuthRequiredMessage;
    case "auth_failed":
      return deletionAuthFailedMessage;
    case "account_not_found":
      return accountDeletionErrorMessages.ACCOUNT_NOT_FOUND;
    case "service_unavailable":
      return accountDeletionUnavailableMessage;
    default:
      return "";
  }
}

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
    "サーバーでエラーが発生しました。時間をおいてもう一度お試しください。"
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

  if (code === "ACCOUNT_ALREADY_PURGED") {
    return "generic";
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

export const httpAccountDeletionGateway: AccountDeletionGateway = {
  startAuth: startAccountDeletionAuth,
  confirm: confirmAccountDeletion,
};
