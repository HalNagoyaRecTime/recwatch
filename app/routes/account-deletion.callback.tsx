import { useLoaderData } from "react-router";

import { confirmAccountDeletion } from "~/features/account-deletion/api/account-deletion-client";
import { consumeDeletionAuthResult } from "~/features/account-deletion/lib/deletionAuthFlow";
import {
  AccountDeletionCallbackPage,
  type AccountDeletionCallbackData,
} from "~/features/account-deletion/pages/AccountDeletionCallbackPage";

const missingResultMessage =
  "確認情報が見つかりませんでした。お手数ですが、削除受付ページからやり直してください。";

export async function clientLoader(): Promise<AccountDeletionCallbackData> {
  const result = consumeDeletionAuthResult();

  if (!result) {
    return { status: "error", message: missingResultMessage };
  }

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  return confirmAccountDeletion(result.token);
}

export default function AccountDeletionCallbackRoute() {
  const data = useLoaderData<typeof clientLoader>();
  return <AccountDeletionCallbackPage data={data} />;
}
