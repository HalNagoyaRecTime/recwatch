import { buildBackendUrl, hasBackendBaseUrl } from "~/config/env";
import { markDeletionAuthPending } from "~/features/account-deletion/lib/deletionAuthFlow";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type StartDeletionAuthResult =
  | { ok: true; authUrl: string }
  | { ok: false; message: string };

export type ConfirmDeletionResult =
  | { status: "done" }
  | { status: "pending" }
  | { status: "error"; message: string };

const unavailableMessage =
  "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。";

export async function startAccountDeletionAuth(): Promise<StartDeletionAuthResult> {
  if (!hasBackendBaseUrl()) {
    return { ok: false, message: unavailableMessage };
  }

  const authUrl = buildBackendUrl("/api/v1/auth/microsoft/delete-login");
  if (!authUrl) {
    return { ok: false, message: unavailableMessage };
  }

  markDeletionAuthPending();
  return { ok: true, authUrl };
}

export async function confirmAccountDeletion(
  deletionConfirmationToken: string
): Promise<ConfirmDeletionResult> {
  void deletionConfirmationToken;
  await wait(700);
  return { status: "done" };
}
