import { useSearchParams } from "react-router";
import { AuthLoginPage } from "~/features/auth/pages/AuthLoginPage";

export default function AuthLoginRoute() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  return <AuthLoginPage initialError={error} />;
}
