import { useState } from "react";

import type { AccountDeletionGateway } from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { AccountDeletionMicrosoftButton } from "~/features/account-deletion/components/AccountDeletionMicrosoftButton";

import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";

export function AccountDeletionPage({
  gateway,
}: {
  gateway: AccountDeletionGateway;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
          Accountを削除
        </h1>
        <p className="text-text-muted mx-auto w-full max-w-md text-left text-sm leading-7">
          Microsoftアカウントで本人確認を行います。
        </p>
      </header>

      <section className="mb-10 space-y-4">
        <p className="text-text-muted mx-auto w-full max-w-md text-left text-sm leading-6">
          Microsoft アカウント自体が削除されることはありません。
        </p>
        {errorMessage ? (
          <AuthErrorMessage>{errorMessage}</AuthErrorMessage>
        ) : null}
        <AccountDeletionMicrosoftButton
          onClick={handleStartDeletion}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting
            ? "本人確認を開始しています..."
            : "Microsoftアカウントで本人確認する"}
        </AccountDeletionMicrosoftButton>
      </section>
    </AccountDeletionLayout>
  );
}
