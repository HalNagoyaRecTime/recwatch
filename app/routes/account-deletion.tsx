import { AccountDeletionPage } from "~/features/account-deletion/pages/AccountDeletionPage";
import { httpAccountDeletionGateway } from "~/features/account-deletion/api/http/account-deletion-gateway";

export default function AccountDeletionRoute() {
  return <AccountDeletionPage gateway={httpAccountDeletionGateway} />;
}
