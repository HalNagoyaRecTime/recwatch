import { Navigate, useLocation } from "react-router";

import { getLegacyDestination } from "./get-legacy-destination";

export default function LegacyRedirectRoute() {
  const location = useLocation();

  return (
    <Navigate
      replace
      to={`${getLegacyDestination(location.pathname)}${location.search}`}
    />
  );
}
