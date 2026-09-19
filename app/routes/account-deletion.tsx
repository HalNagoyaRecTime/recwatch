import { useSearchParams } from "react-router";

import { httpAccountDeletionGateway } from "~/features/account-deletion/api/http/account-deletion-gateway";
import { AccountDeletionPage } from "~/features/account-deletion/pages/AccountDeletionPage";

export function meta() {
  return [
    { title: "RE:CREATION | アカウント削除" },
    { name: "theme-color", content: "#ffffff" },
    { name: "color-scheme", content: "light" },
  ];
}

export default function AccountDeletionRoute() {
  const [searchParams] = useSearchParams();
  const initialError = searchParams.get("error");

  return (
    <AccountDeletionPage
      key={initialError ?? "default"}
      gateway={httpAccountDeletionGateway}
      initialError={initialError}
    />
  );
}
