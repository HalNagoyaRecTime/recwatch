import { useState } from "react";

import {
  accountDeletionUnavailableMessage,
  startAccountDeletionAuth,
} from "~/features/account-deletion/api/account-deletion-client";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { accountDeletionContent } from "~/features/account-deletion/content/account-deletion-content";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { AuthPrimaryButton } from "~/features/auth/components/AuthPrimaryButton";
import { MicrosoftLogo } from "~/features/auth/components/MicrosoftLogo";

export function AccountDeletionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleStartDeletion() {
    if (isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await startAccountDeletionAuth().catch(
      () => ({ ok: false, message: accountDeletionUnavailableMessage }) as const
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

      <section className="border-tone-danger-border bg-tone-danger-bg text-tone-danger-text app-rounded border p-4">
        <h2 className="text-sm font-semibold">大切な注意</h2>
        <p className="mt-2 text-sm leading-6">
          {accountDeletionContent.scopeNotice}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          heading="削除される情報"
          items={accountDeletionContent.targets}
        />
        <InfoCard
          heading="削除されない情報"
          items={accountDeletionContent.nonTargets}
        />
      </div>

      <ListCard
        heading={accountDeletionContent.retention.heading}
        items={accountDeletionContent.retention.items}
      />
      <ListCard
        heading={accountDeletionContent.contact.heading}
        items={accountDeletionContent.contact.items}
      />

      <section className="border-border-base bg-surface-base shadow-soft app-rounded border p-5">
        <h2 className="text-text-base text-sm font-semibold">
          本人確認について
        </h2>
        <p className="text-text-muted mt-2 text-sm leading-6">
          削除対象を本人が指定できるようにするため、学校から付与されたMicrosoft
          365アカウントで再認証します。本人確認後に、最終的な削除操作を行います。
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
            : "Microsoftアカウントで本人確認を開始"}
        </AuthPrimaryButton>
      </section>
    </AccountDeletionLayout>
  );
}

function InfoCard({
  heading,
  items,
}: {
  heading: string;
  items: readonly string[];
}) {
  return <ListCard heading={heading} items={items} />;
}

function ListCard({
  heading,
  items,
}: {
  heading: string;
  items: readonly string[];
}) {
  return (
    <section className="border-border-base bg-surface-base shadow-soft app-rounded border p-4">
      <h2 className="text-text-base text-sm font-semibold">{heading}</h2>
      <ul className="text-text-muted mt-2 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-brand-primary mt-2 size-1.5 shrink-0 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
