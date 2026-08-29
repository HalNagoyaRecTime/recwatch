import { useLoaderData } from "react-router";

import { confirmAccountDeletion } from "~/features/account-deletion/api/account-deletion-client";
import {
  AccountDeletionCallbackPage,
  type AccountDeletionCallbackData,
} from "~/features/account-deletion/pages/AccountDeletionCallbackPage";

const missingStateMessage =
  "確認情報が見つかりませんでした。お手数ですが、削除受付ページからやり直してください。";

export async function clientLoader({
  request,
}: {
  request: Request;
}): Promise<AccountDeletionCallbackData> {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!state) {
    return { status: "error", message: missingStateMessage };
  }

  return confirmAccountDeletion({ state, code });
}

export default function AccountDeletionCallbackRoute() {
  const data = useLoaderData<typeof clientLoader>();
  return <AccountDeletionCallbackPage data={data} />;
}
