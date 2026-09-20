import { useState } from "react";

import { getAccountDeletionInitialErrorMessage } from "~/features/account-deletion/api/http/account-deletion-gateway";
import type { AccountDeletionGateway } from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionErrorMessage } from "~/features/account-deletion/components/AccountDeletionErrorMessage";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { AccountDeletionMicrosoftButton } from "~/features/account-deletion/components/AccountDeletionMicrosoftButton";

export function AccountDeletionPage({
  gateway,
  initialError,
}: {
  gateway: AccountDeletionGateway;
  initialError?: string | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() =>
    getAccountDeletionInitialErrorMessage(initialError ?? null)
  );

  async function handleStartDeletion() {
    if (isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await gateway.startAuth().catch(
      () =>
        ({
          ok: false,
          message:
            "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。",
        }) as const
    );

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    // 戻り先はBackendが固定したcallbackだけを使い、任意URLは受け取らない。
    window.location.href = result.authUrl;
  }

  return (
    <AccountDeletionLayout>
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#333333] sm:text-3xl">
          アカウントを削除
        </h1>
        <p className="text-text-muted mx-auto w-full max-w-md text-center text-sm leading-7">
          アカウントの削除手続きを行います。
        </p>
      </header>

      <section className="space-y-3">
        {errorMessage ? (
          <AccountDeletionErrorMessage>
            {errorMessage}
          </AccountDeletionErrorMessage>
        ) : null}
        <AccountDeletionMicrosoftButton
          onClick={handleStartDeletion}
          isLoading={isSubmitting}
        >
          {isSubmitting
            ? "Microsoft アカウントで認証する..."
            : "Microsoft アカウントで認証する"}
        </AccountDeletionMicrosoftButton>
      </section>
    </AccountDeletionLayout>
  );
}
