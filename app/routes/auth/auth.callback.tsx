import { redirect } from "react-router";
import { buildBackendUrl } from "~/config/env";
import {
  consumeDeletionAuthPending,
  saveDeletionAuthResult,
} from "~/features/account-deletion/lib/deletionAuthFlow";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import { WEB_CLIENT_HEADERS } from "~/features/auth/lib/webClientHeaders";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";

const deletionAuthFailedMessage =
  "本人確認に失敗しました。削除受付ページからもう一度お試しください。";

type TokenExchangeResponse = {
  access_token: string;
  refresh_token_id: string;
};

type DeletionTokenResponse = {
  deletion_confirmation_token: string;
  expires_in: number;
};

function isDeletionTokenResponse(
  value: unknown
): value is DeletionTokenResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).deletion_confirmation_token ===
      "string"
  );
}

function isTokenExchangeResponse(
  value: unknown
): value is TokenExchangeResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).access_token === "string" &&
    typeof (value as Record<string, unknown>).refresh_token_id === "string"
  );
}

type BackendErrorResponse = { error: { code: string; message: string } };

function isBackendErrorResponse(value: unknown): value is BackendErrorResponse {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = (value as Record<string, unknown>).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

async function handleDeletionAuthCallback(
  code: string | null,
  state: string | null,
  error: string | null
) {
  if (error || !code || !state) {
    saveDeletionAuthResult({
      status: "error",
      message: deletionAuthFailedMessage,
    });
    throw redirect("/account-deletion/callback");
  }

  const deleteTokenUrl = buildBackendUrl("/api/v1/auth/microsoft/delete-token");
  if (!deleteTokenUrl) {
    saveDeletionAuthResult({
      status: "error",
      message: deletionAuthFailedMessage,
    });
    throw redirect("/account-deletion/callback");
  }

  const res = await fetch(deleteTokenUrl, {
    method: "POST",
    headers: {
      ...WEB_CLIENT_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, state }),
  }).catch(() => null);

  const payload: unknown = res ? await res.json().catch(() => null) : null;

  if (!res?.ok || !isDeletionTokenResponse(payload)) {
    const message = isBackendErrorResponse(payload)
      ? payload.error.message
      : deletionAuthFailedMessage;
    saveDeletionAuthResult({ status: "error", message });
    throw redirect("/account-deletion/callback");
  }

  saveDeletionAuthResult({
    status: "confirmed",
    token: payload.deletion_confirmation_token,
  });
  throw redirect("/account-deletion/callback");
}

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (consumeDeletionAuthPending()) {
    return handleDeletionAuthCallback(code, state, error);
  }

  if (error || !code || !state) {
    throw redirect("/login?error=auth_failed");
  }

  const tokenUrl = buildBackendUrl("/api/v1/auth/microsoft/token");
  if (!tokenUrl) {
    throw redirect("/login?error=auth_failed");
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      ...WEB_CLIENT_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, state }),
  }).catch(() => null);

  const payload: unknown = res ? await res.json().catch(() => null) : null;

  if (!res?.ok || !isTokenExchangeResponse(payload)) {
    if (
      res &&
      !res.ok &&
      isBackendErrorResponse(payload) &&
      payload.error.code === "ACCOUNT_DELETION_PENDING"
    ) {
      throw redirect("/login?error=account_deletion_pending");
    }
    throw redirect("/login?error=auth_failed");
  }

  setAccessToken(payload.access_token);
  setRefreshTokenId(payload.refresh_token_id);

  throw redirect("/");
}

export default function AuthCallbackRoute() {
  return null;
}
