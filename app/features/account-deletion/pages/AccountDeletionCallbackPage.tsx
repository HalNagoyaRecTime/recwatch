import { Link } from "react-router";

import { AccountDeletionLayout } from "~/features/account-deletion/components/AccountDeletionLayout";
import { AuthErrorMessage } from "~/features/auth/components/AuthErrorMessage";

export type AccountDeletionCallbackData =
  | { status: "done" }
  | { status: "pending" }
  | { status: "error"; message: string };

export function AccountDeletionCallbackPage({
  data,
}: {
  data: AccountDeletionCallbackData;
}) {
  return (
    <AccountDeletionLayout>
      <div className="space-y-4 text-center">
        {data.status === "done" ? (
          <>
            <h1 className="text-text-base text-xl font-semibold">
              削除を受け付けました
            </h1>
            <p className="text-text-muted text-sm leading-6">
              RecTimeアカウントの削除処理を開始しました。以後、このアカウントでログインすることはできません。
            </p>
          </>
        ) : null}

        {data.status === "pending" ? (
          <>
            <h1 className="text-text-base text-xl font-semibold">
              削除処理を受け付けました
            </h1>
            <p className="text-text-muted text-sm leading-6">
              削除処理を実行しています。完了までしばらくお待ちください。
            </p>
          </>
        ) : null}

        {data.status === "error" ? (
          <>
            <h1 className="text-text-base text-xl font-semibold">
              削除を完了できませんでした
            </h1>
            <AuthErrorMessage>{data.message}</AuthErrorMessage>
          </>
        ) : null}

        <Link
          to="/account-deletion"
          className="text-brand-primary inline-block text-sm font-medium hover:underline"
        >
          削除受付ページに戻る
        </Link>
      </div>
    </AccountDeletionLayout>
  );
}
