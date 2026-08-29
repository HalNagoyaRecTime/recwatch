import { useState } from "react";
import { startAccountDeletionAuth } from "~/features/account-deletion/api/account-deletion-client";
import { accountDeletionContent } from "~/features/account-deletion/content/account-deletion-content";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { AuthLayout } from "~/features/auth/components/AuthLayout";
import { AuthPrimaryButton } from "~/features/auth/components/AuthPrimaryButton";
import { MicrosoftLogo } from "~/features/auth/components/MicrosoftLogo";

const unavailableMessage =
  "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。";

export function AccountDeletionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleStartDeletion() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await startAccountDeletionAuth().catch(
      () => ({ ok: false, message: unavailableMessage }) as const
    );

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.authUrl;
  }

  return (
    <AuthLayout contentClassName="flex w-full max-w-md flex-1 flex-col justify-center gap-4">
      <div className="space-y-2 text-center">
        <h1 className="text-text-base text-xl font-semibold">
          {accountDeletionContent.title}
        </h1>
        <p className="text-text-muted text-sm leading-6">
          {accountDeletionContent.lead}
        </p>
      </div>

      <InfoCard
        heading="削除される情報"
        items={accountDeletionContent.targets}
      />
      <InfoCard
        heading="削除されない情報"
        items={accountDeletionContent.nonTargets}
      />

      <TextCard
        heading={accountDeletionContent.retention.heading}
        body={accountDeletionContent.retention.body}
      />
      <ContactCard
        heading="お問い合わせ"
        lines={accountDeletionContent.contact}
      />

      {errorMessage ? (
        <AuthErrorMessage>{errorMessage}</AuthErrorMessage>
      ) : null}

      <AuthPrimaryButton
        className="gap-3"
        onClick={handleStartDeletion}
        disabled={isSubmitting}
      >
        <MicrosoftLogo />
        {isSubmitting
          ? "確認しています..."
          : "Microsoftアカウントで本人確認して削除を進める"}
      </AuthPrimaryButton>
    </AuthLayout>
  );
}

function InfoCard({
  heading,
  items,
}: {
  heading: string;
  items: readonly string[];
}) {
  return (
    <section className="border-border-subtle bg-surface-base shadow-soft rounded-2xl border p-4">
      <h2 className="text-text-base text-sm font-semibold">{heading}</h2>
      <ul className="text-text-muted mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function TextCard({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="border-border-subtle bg-surface-base shadow-soft rounded-2xl border p-4">
      <h2 className="text-text-base text-sm font-semibold">{heading}</h2>
      <p className="text-text-muted mt-2 text-sm leading-6">{body}</p>
    </section>
  );
}

function ContactCard({
  heading,
  lines,
}: {
  heading: string;
  lines: readonly string[];
}) {
  return (
    <section className="border-border-subtle bg-surface-base shadow-soft rounded-2xl border p-4">
      <h2 className="text-text-base text-sm font-semibold">{heading}</h2>
      <div className="text-text-muted mt-2 text-sm leading-6">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}
