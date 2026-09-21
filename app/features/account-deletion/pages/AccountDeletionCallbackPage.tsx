import { useEffect, useId, useState, type ReactNode } from "react";
import { CheckCircle2, Info, Trash2, TriangleAlert } from "lucide-react";
import { Link, useNavigate } from "react-router";

import type {
  AccountDeletionErrorReason,
  AccountDeletionGateway,
  ConfirmDeletionResult,
} from "~/features/account-deletion/api/contracts/account-deletion-gateway";
import { AccountDeletionErrorMessage } from "~/features/account-deletion/components/AccountDeletionErrorMessage";
import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import {
  clearDeletionAuthPending,
  clearDeletionAuthResult,
} from "~/features/account-deletion/lib/deletionAuthFlow";

export type AccountDeletionCallbackData =
  | { status: "confirm"; deletionConfirmationToken: string }
  | { status: "done" }
  | { status: "completed" }
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
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const navigate = useNavigate();

  function handleCancelDeletion() {
    clearDeletionAuthPending();
    clearDeletionAuthResult();
    navigate("/account-deletion", { replace: true });
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

    if (result.status === "done") {
      setView({ status: "done" });
    } else if (
      result.status === "error" &&
      result.code === "ACCOUNT_ALREADY_PURGED"
    ) {
      setView({ status: "completed" });
    } else {
      setView({
        status: "error",
        message: result.message || unexpectedDeletionErrorMessage,
        reason: result.reason,
      });
    }

    setIsConfirmationOpen(false);
    setIsSubmitting(false);
  }

  return (
    <AccountDeletionLayout>
      {view.status === "confirm" ? (
        <ConfirmationView
          isSubmitting={isSubmitting}
          onRequestConfirmation={() => setIsConfirmationOpen(true)}
          onCancel={handleCancelDeletion}
        />
      ) : null}

      {isConfirmationOpen ? (
        <DeleteConfirmationModal
          isSubmitting={isSubmitting}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleConfirmDeletion}
        />
      ) : null}

      {view.status === "done" ? <CompletionView /> : null}

      {view.status === "completed" ? <CompletionView alreadyCompleted /> : null}

      {view.status === "error" ? (
        <ErrorView message={view.message} reason={view.reason} />
      ) : null}
    </AccountDeletionLayout>
  );
}

function ConfirmationView({
  isSubmitting,
  onRequestConfirmation,
  onCancel,
}: {
  isSubmitting: boolean;
  onRequestConfirmation: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#333333] sm:text-3xl">
          アカウントを削除
        </h1>
      </header>

      <section className="border-border-base bg-surface-muted text-text-base rounded-lg border p-5">
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
        <DeleteActionButton
          disabled={isSubmitting}
          isSubmitting={isSubmitting}
          onClick={onRequestConfirmation}
        >
          アカウントを削除する
        </DeleteActionButton>
        <button
          className="text-text-muted hover:bg-surface-hover hover:text-text-base inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-transparent px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          onClick={onCancel}
          type="button"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function DeleteActionButton({
  children,
  disabled = false,
  isSubmitting,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  isSubmitting: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="bg-tone-danger-text inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 font-medium text-white transition-colors hover:brightness-90 disabled:pointer-events-none disabled:opacity-50"
      onClick={onClick}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
    >
      <Trash2 aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">{isSubmitting ? "削除中..." : children}</span>
    </button>
  );
}

function DeleteConfirmationModal({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="border-border-base bg-surface-base w-full max-w-md overflow-hidden rounded-lg border px-5 shadow-lg"
        role="dialog"
      >
        <header className="flex flex-col items-center justify-between gap-2 pt-6 pb-3">
          <h2
            className="text-text-base w-fit text-lg leading-tight font-semibold"
            id={titleId}
          >
            本当にアカウントを削除しますか？
          </h2>
          <p
            className="text-text-muted w-fit text-sm leading-6"
            id={descriptionId}
          >
            この操作は取り消せません。
          </p>
        </header>

        <div className="pb-2">
          <div className="flex flex-col gap-1">
            <DeleteActionButton isSubmitting={isSubmitting} onClick={onConfirm}>
              削除する
            </DeleteActionButton>
            <button
              className="border-border-base bg-surface-base text-text-muted hover:border-border-strong hover:text-text-base inline-flex h-12 w-full items-center justify-center rounded-lg border px-4 text-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              とじる
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CompletionView({
  alreadyCompleted = false,
}: {
  alreadyCompleted?: boolean;
}) {
  return (
    <div className="space-y-5 text-center">
      <header className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2
            aria-hidden="true"
            className="text-tone-success-text size-5 shrink-0"
          />
          <h1 className="text-text-base text-xl leading-tight font-semibold sm:text-2xl">
            {alreadyCompleted
              ? "削除処理は完了しています"
              : "削除が完了しました"}
          </h1>
        </div>
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
  const isReauthenticationRequired = reason === "reauth";
  const title = isReauthenticationRequired
    ? "認証情報を確認できませんでした"
    : "サーバーでエラーが発生しました";

  return (
    <div className="space-y-5 text-center">
      <header>
        <h1 className="text-text-base text-xl leading-tight font-semibold sm:text-2xl">
          {title}
        </h1>
      </header>
      <AccountDeletionErrorMessage>{message}</AccountDeletionErrorMessage>
      <div className="flex justify-center">
        <Link
          className="border-border-base bg-surface-base text-text-muted hover:border-border-strong hover:text-text-base inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors"
          to="/account-deletion"
        >
          アカウント削除ページに戻る
        </Link>
      </div>
    </div>
  );
}
