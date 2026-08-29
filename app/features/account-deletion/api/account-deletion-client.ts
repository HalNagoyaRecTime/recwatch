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

// TODO(rectime-api#265): 削除専用のMicrosoft認証エンドポイントが実装されたら、
// authUrl を実際のMicrosoft認証URLに差し替える。呼び出し側は
// window.location.href = authUrl のままで変更不要。
export async function startAccountDeletionAuth(): Promise<StartDeletionAuthResult> {
  await wait(500);
  const mockState = crypto.randomUUID();
  return {
    ok: true,
    authUrl: `/account-deletion/callback?state=${encodeURIComponent(mockState)}`,
  };
}

// TODO(rectime-api#265): DELETE /api/v1/auth/me 相当の実APIに差し替える。
export async function confirmAccountDeletion(params: {
  state: string;
  code: string | null;
}): Promise<ConfirmDeletionResult> {
  void params;
  await wait(700);
  return { status: "done" };
}
