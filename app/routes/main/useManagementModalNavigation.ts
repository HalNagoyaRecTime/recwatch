import { useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useRevalidator,
  useOutletContext,
} from "react-router";

export type ManagementModalNavigation = (
  revalidateList?: boolean
) => Promise<void>;

export function useManagementModalNavigation(
  listPath: string
): ManagementModalNavigation {
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  return useCallback(
    async (revalidateList = false) => {
      await navigate(
        { pathname: listPath, search: location.search },
        { replace: true }
      );
      if (revalidateList) await revalidator.revalidate();
    },
    [listPath, location.search, navigate, revalidator]
  );
}

export function useManagementModalReturn(): ManagementModalNavigation {
  return useOutletContext<ManagementModalNavigation>();
}
