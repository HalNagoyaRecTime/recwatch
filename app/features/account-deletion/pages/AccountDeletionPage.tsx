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
      <header className="text-center">
        <h1 className="text-sm leading-7 font-normal text-black">
          アカウントの削除手続き
        </h1>
      </header>

      <section className="space-y-2">
        <AccountDeletionMicrosoftButton
          onClick={handleStartDeletion}
          isLoading={isSubmitting}
        >
          Microsoft アカウントで認証する
        </AccountDeletionMicrosoftButton>
        <AccountDeletionErrorMessage>
          {errorMessage}
        </AccountDeletionErrorMessage>
      </section>
    </AccountDeletionLayout>
  );
}
