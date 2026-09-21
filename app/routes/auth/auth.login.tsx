import { useSearchParams } from "react-router";
import { clearDeletionAuthPending } from "~/features/account-deletion/lib/deletionAuthFlow";
import { AuthLoginPage } from "~/features/auth/pages/AuthLoginPage";

export function clientLoader() {
  clearDeletionAuthPending();
}

export default function AuthLoginRoute() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  return <AuthLoginPage initialError={error} />;
}
