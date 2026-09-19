import { useState } from "react";
import {
  CheckCircle2,
  Info,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router";

import type {
  AccountDeletionErrorReason,
  AccountDeletionGateway,
  ConfirmDeletionResult,
} from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import {
  clearDeletionAuthPending,
  clearDeletionAuthResult,
} from "~/features/account-deletion/lib/deletionAuthFlow";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";
import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { setAccessToken } from "~/features/auth/lib/accessTokenStore";
import { setRefreshTokenId } from "~/features/auth/lib/refreshTokenStore";

export type AccountDeletionCallbackData =
  | { status: "confirm"; deletionConfirmationToken: string }
  | { status: "accepted" }
  | { status: "done" }
  | { status: "pending" }
  | {
      status: "error";
      message: string;
      reason?: AccountDeletionErrorReason;
    };

const unexpectedDeletionErrorMessage =
  "削除受付サービスで予期しないエラーが発生しました。時間をおいてもう一度お試しください。";

export function AccountDeletionCallbackPage({
  data,
  gateway,
}: {
  data: AccountDeletionCallbackData;
  gateway: AccountDeletionGateway;
}) {
  const [view, setView] = useState(data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleCancelDeletion() {
    clearDeletionAuthPending();
    clearDeletionAuthResult();
    navigate("/login", { replace: true });
  }

  async function handleConfirmDeletion() {
    if (isSubmitting || view.status !== "confirm") return;

    const token = view.deletionConfirmationToken;
    setIsSubmitting(true);

    const result = await gateway.confirm(token).catch(
      () =>
        ({
          status: "error",
          code: "NETWORK_ERROR",
          message:
            "削除受付サービスに接続できませんでした。時間をおいてもう一度お試しください。",
          reason: "generic",
        }) satisfies ConfirmDeletionResult
    );

    if (result.status === "accepted" || result.status === "done") {
      // 削除成功後は通常ログイン用の認証情報も残さない。
      setAccessToken(null);
      setRefreshTokenId(null);
      setView({ status: "accepted" });
    } else if (result.status === "pending") {
      setView({ status: "pending" });
    } else {
      setView({
        status: "error",
        message: result.message || unexpectedDeletionErrorMessage,
        reason: result.reason,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <AccountDeletionLayout>
      {view.status === "confirm" ? (
        <ConfirmationView
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmDeletion}
          onCancel={handleCancelDeletion}
        />
      ) : null}

      {view.status === "accepted" ||
      view.status === "done" ||
      view.status === "pending" ? (
        <CompletionView />
      ) : null}

      {view.status === "error" ? (
        <ErrorView message={view.message} reason={view.reason} />
      ) : null}
    </AccountDeletionLayout>
  );
}

function ConfirmationView({
  isSubmitting,
  onConfirm,
  onCancel,
}: {
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#333333] sm:text-3xl">
          アカウントを削除
        </h1>
      </header>

      <section className="app-rounded border-border-base bg-surface-muted text-text-base border p-5">
        <h2 className="text-sm font-semibold">確認事項</h2>
        <div className="mt-4 space-y-3">
          <p className="flex items-start gap-2 text-sm leading-6">
            <TriangleAlert
              aria-hidden="true"
              className="text-tone-warning-text mt-0.5 size-4 shrink-0"
            />
            <span>この操作は取り消せません。</span>
          </p>
          <p className="text-text-muted flex items-start gap-2 text-xs leading-5">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>Microsoft アカウントが削除されることはありません。</span>
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="app-rounded bg-tone-danger-text inline-flex h-12 w-full items-center justify-center gap-2 px-4 font-medium text-white transition-colors hover:brightness-90 disabled:pointer-events-none disabled:opacity-50"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <Trash2 aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">
            {isSubmitting ? "アカウントを削除する..." : "アカウントを削除する"}
          </span>
        </button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}

function CompletionView() {
  return (
    <div className="space-y-5 text-center">
      <CheckCircle2
        aria-hidden="true"
        className="text-tone-success-text mx-auto size-12"
      />
      <header className="space-y-2">
        <h1 className="text-text-base text-2xl font-semibold">
          削除を受け付けました
        </h1>
        <p className="text-text-muted text-sm leading-7">
          このアカウントは利用できなくなります。
        </p>
      </header>
    </div>
  );
}

function ErrorView({
  message,
  reason,
}: {
  message: string;
  reason?: AccountDeletionErrorReason;
}) {
  const title =
    reason === "already-deleted"
      ? "削除受付済みです"
      : reason === "reauth"
        ? "本人確認の有効期限が切れました"
        : "削除を受け付けられませんでした";

  return (
    <div className="space-y-5 text-center">
      <header className="space-y-2">
        <h1 className="text-text-base text-2xl font-semibold">{title}</h1>
        <p className="text-text-muted text-sm leading-7">
          削除受付を完了できませんでした。
        </p>
      </header>
      <AuthErrorMessage>{message}</AuthErrorMessage>
      <div className="flex justify-center">
        <ButtonLink
          to="/account-deletion"
          variant="secondary"
          size="lg"
          icon={RotateCcw}
        >
          Microsoft アカウントで本人確認をやり直す
        </ButtonLink>
      </div>
    </div>
  );
}
