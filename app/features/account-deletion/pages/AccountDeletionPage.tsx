import { useState } from "react";

import type { AccountDeletionGateway } from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { accountDeletionContent } from "~/features/account-deletion/content/account-deletion-content";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { AuthPrimaryButton } from "~/features/auth/components/AuthPrimaryButton";
import { MicrosoftLogo } from "~/features/auth/components/MicrosoftLogo";

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
          message: accountDeletionContent.unavailableMessage,
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
      <header className="space-y-3 text-center">
        <p className="text-brand-primary text-xs font-semibold tracking-[0.16em] uppercase">
          アカウント削除手続き
        </p>
        <h1 className="text-text-base text-2xl font-semibold tracking-tight sm:text-3xl">
          {accountDeletionContent.title}
        </h1>
        <p className="text-text-muted text-sm leading-7">
          {accountDeletionContent.lead}
        </p>
      </header>

      <section className="border-border-base bg-surface-base shadow-soft app-rounded border p-5">
        <p className="text-text-muted text-sm leading-6">
          {accountDeletionContent.microsoftAccountNotice}
        </p>
        {errorMessage ? (
          <div className="mt-4">
            <AuthErrorMessage>{errorMessage}</AuthErrorMessage>
          </div>
        ) : null}

        <AuthPrimaryButton
          className="mt-5 gap-3"
          onClick={handleStartDeletion}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <MicrosoftLogo />
          {isSubmitting
            ? "本人確認を開始しています..."
            : "Microsoft 365で本人確認する"}
        </AuthPrimaryButton>
      </section>
    </AccountDeletionLayout>
  );
}
