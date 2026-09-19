import { AccountDeletionPage } from "~/features/account-deletion/pages/AccountDeletionPage";
import { httpAccountDeletionGateway } from "~/features/account-deletion/api/http/account-deletion-gateway";

export function meta() {
  return [
    { name: "theme-color", content: "#ffffff" },
    { name: "color-scheme", content: "light" },
  ];
}
export default function AccountDeletionRoute() {
  return <AccountDeletionPage gateway={httpAccountDeletionGateway} />;
}
