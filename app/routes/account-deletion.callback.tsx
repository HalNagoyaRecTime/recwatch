import { useLoaderData } from "react-router";

import { httpAccountDeletionGateway } from "~/features/account-deletion/api/http/account-deletion-gateway";
import { AccountDeletionCallbackPage } from "~/features/account-deletion/pages/AccountDeletionCallbackPage";
import type { AccountDeletionCallbackData } from "~/features/account-deletion/pages/AccountDeletionCallbackPage";
import {
  consumeDeletionAuthResult,
  type DeletionAuthResult,
} from "~/features/account-deletion/lib/deletionAuthFlow";

export function meta() {
  return [
    { title: "RE:CREATION | アカウント削除" },
    { name: "theme-color", content: "#ffffff" },
    { name: "color-scheme", content: "light" },
  ];
}
const missingResultMessage =
  "本人確認の結果を確認できませんでした。削除受付ページからやり直してください。";

export async function clientLoader(): Promise<AccountDeletionCallbackData> {
  const result = consumeDeletionAuthResult();

  if (!result) {
    return {
      status: "error",
      message: missingResultMessage,
      reason: "reauth",
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message,
      reason: "reauth",
    };
  }

  return toConfirmationData(result);
}

function toConfirmationData(
  result: Extract<DeletionAuthResult, { status: "confirmed" }>
): AccountDeletionCallbackData {
  return {
    status: "confirm",
    deletionConfirmationToken: result.token,
  };
}

export default function AccountDeletionCallbackRoute() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <AccountDeletionCallbackPage
      data={data}
      gateway={httpAccountDeletionGateway}
    />
  );
}
