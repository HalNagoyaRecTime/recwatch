import { useState } from "react";
import { buildBackendUrl, hasBackendBaseUrl } from "~/config/env";

// import { AuthAlternativeLoginSection } from "~/features/auth/components/AuthAlternativeLoginSection";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { AuthLayout } from "~/features/auth/components/AuthLayout";
import { AuthPrimaryButton } from "~/features/auth/components/AuthPrimaryButton";
import { MicrosoftLogo } from "~/features/auth/components/MicrosoftLogo";

const backendUnavailableMessage =
  "ログインサービスに接続できませんでした。時間をおいてもう一度お試しください。";

export function AuthLoginPage({
  initialError,
}: {
  initialError?: string | null;
}) {
  const [errorMessage, setErrorMessage] = useState(
    initialError === "auth_failed"
      ? "ログインに失敗しました。もう一度お試しください。"
      : ""
  );
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);

  async function handleOAuthLogin() {
    try {
      setErrorMessage("");
      setIsOAuthSubmitting(true);
      if (!hasBackendBaseUrl()) {
        setErrorMessage(backendUnavailableMessage);
        setIsOAuthSubmitting(false);
        return;
      }

      const healthUrl = buildBackendUrl("/");
      const loginUrl = buildBackendUrl("/api/v1/auth/microsoft/login");
      if (!healthUrl || !loginUrl) {
        setErrorMessage(backendUnavailableMessage);
        setIsOAuthSubmitting(false);
        return;
      }

      const healthRes = await fetch(healthUrl, {
        cache: "no-store",
      }).catch(() => null);

      if (!healthRes?.ok) {
        setErrorMessage(backendUnavailableMessage);
        setIsOAuthSubmitting(false);
        return;
      }

      window.location.href = loginUrl;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ログインの開始に失敗しました。"
      );
      setIsOAuthSubmitting(false);
    }
  }

  return (
    <AuthLayout contentClassName="flex w-full max-w-sm flex-1 flex-col justify-center">
      <div className="space-y-3">
        {errorMessage ? (
          <AuthErrorMessage>{errorMessage}</AuthErrorMessage>
        ) : null}

        <AuthPrimaryButton
          className="gap-3"
          onClick={handleOAuthLogin}
          disabled={isOAuthSubmitting}
        >
          <MicrosoftLogo />
          {isOAuthSubmitting
            ? "ログイン中..."
            : "Microsoft アカウントでログイン"}
        </AuthPrimaryButton>
        {/* 未実装機能・メールアドレスログイン */}
        {/*<AuthAlternativeLoginSection*/}
        {/*  isOAuthSubmitting={isOAuthSubmitting}*/}
        {/*  onError={setErrorMessage}*/}
        {/*/>*/}
      </div>
    </AuthLayout>
  );
}
