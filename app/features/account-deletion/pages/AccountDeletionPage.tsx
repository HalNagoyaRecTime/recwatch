import { useState } from "react";

import type { AccountDeletionGateway } from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { AccountDeletionMicrosoftButton } from "~/features/account-deletion/components/AccountDeletionMicrosoftButton";

import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";

import { Info } from "lucide-react";

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
          アカウントを削除
        </h1>
        <p className="text-text-muted mx-auto w-full max-w-md text-center text-sm leading-7">
          アカウントの削除手続きを行います。
        </p>
      </header>

      <section className="space-y-3">
        {errorMessage ? (
          <AuthErrorMessage>{errorMessage}</AuthErrorMessage>
        ) : null}
        <AccountDeletionMicrosoftButton
          onClick={handleStartDeletion}
          isLoading={isSubmitting}
        >
          {isSubmitting
            ? "Microsoft アカウントで認証する..."
            : "Microsoft アカウントで認証する"}
        </AccountDeletionMicrosoftButton>
        <div className="text-text-muted flex items-center justify-center gap-1">
          <Info size={16} className="mb-px shrink-0" />
          <p className="text-[12px] leading-4">
            Microsoft アカウントが削除されることはありません。
          </p>
        </div>
      </section>
    </AccountDeletionLayout>
  );
}
