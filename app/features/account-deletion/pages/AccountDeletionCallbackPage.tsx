import { useState } from "react";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router";

import {
  accountDeletionUnavailableMessage,
  confirmAccountDeletion,
  type AccountDeletionErrorReason,
  type ConfirmDeletionResult,
} from "~/features/account-deletion/api/account-deletion-client";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
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
}: {
  data: AccountDeletionCallbackData;
}) {
  const [view, setView] = useState(data);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirmDeletion() {
    if (isSubmitting || view.status !== "confirm") return;

    const token = view.deletionConfirmationToken;
    setIsSubmitting(true);

    const result = await confirmAccountDeletion(token).catch(
      () =>
        ({
          status: "error",
          code: "NETWORK_ERROR",
          message: accountDeletionUnavailableMessage,
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
        />
      ) : null}

      {view.status === "accepted" || view.status === "done" ? (
        <AcceptedView />
      ) : null}

      {view.status === "pending" ? <PendingView /> : null}

      {view.status === "error" ? (
        <ErrorView message={view.message} reason={view.reason} />
      ) : null}
    </AccountDeletionLayout>
  );
}

function ConfirmationView({
  isSubmitting,
  onConfirm,
}: {
  isSubmitting: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-2 text-center">
        <p className="text-brand-primary text-xs font-semibold tracking-[0.16em] uppercase">
          本人確認が完了しました
        </p>
        <h1 className="text-text-base text-2xl font-semibold">
          削除を実行しますか？
        </h1>
        <p className="text-text-muted text-sm leading-7">
          最終操作を行うと、RecTimeアカウントとRecTimeが管理する関連データの削除受付が始まります。この操作は取り消せません。
        </p>
      </header>

      <section className="border-tone-danger-border bg-tone-danger-bg text-tone-danger-text app-rounded border p-5">
        <h2 className="text-sm font-semibold">削除前にご確認ください</h2>
        <ul className="mt-2 space-y-2 text-sm leading-6">
          <li>削除後はRecTimeを利用できなくなります。</li>
          <li>Microsoft 365アカウントそのものは削除されません。</li>
          <li>
            学校やMicrosoft側のメール・ファイル・公式記録には影響しません。
          </li>
        </ul>
      </section>

      <div className="flex justify-center">
        <Button
          icon={Trash2}
          variant="danger"
          size="lg"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? "削除受付を送信しています..."
            : "RecTimeアカウントを削除する"}
        </Button>
      </div>
    </div>
  );
}

function AcceptedView() {
  return (
    <div className="space-y-5 text-center">
      <CheckCircle2
        aria-hidden="true"
        className="text-tone-success-text mx-auto size-12"
      />
      <header className="space-y-2">
        <h1 className="text-text-base text-2xl font-semibold">
          削除受付を完了しました
        </h1>
        <p className="text-text-muted text-sm leading-7">
          BackendがRecTimeアカウントの削除要求を正常に受け付けました。以後、このアカウントでRecTimeを利用することはできません。
        </p>
        <p className="text-text-muted text-sm leading-7">
          Microsoft 365アカウントそのものは削除されません。
        </p>
      </header>
    </div>
  );
}

function PendingView() {
  return (
    <div className="space-y-5 text-center">
      <header className="space-y-2">
        <h1 className="text-text-base text-2xl font-semibold">
          削除処理を受け付けました
        </h1>
        <p className="text-text-muted text-sm leading-7">
          RecTimeアカウントの削除処理を受け付けました。以後、このアカウントでRecTimeを利用することはできません。
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
          Microsoftアカウントで本人確認をやり直す
        </ButtonLink>
      </div>
      <Link
        to="/account-deletion"
        className="text-text-muted hover:text-text-base inline-block text-sm hover:underline"
      >
        削除受付ページの説明に戻る
      </Link>
    </div>
  );
}
