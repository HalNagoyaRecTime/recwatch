import { useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useRevalidator,
  useOutletContext,
} from "react-router";

import type { ManagementOptionState } from "~/hooks/useManagementOptions";

export type ManagementModalNavigation = (
  revalidateList?: boolean
) => Promise<void>;

export type ManagementRouteOutletContext<T> = {
  closeModal: ManagementModalNavigation;
  options: ManagementOptionState<T>;
};

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
  const context = useOutletContext<
    ManagementModalNavigation | ManagementRouteOutletContext<unknown>
  >();
  return typeof context === "function" ? context : context.closeModal;
}

export function useManagementRouteOptions<T>(): ManagementOptionState<T> {
  const context = useOutletContext<
    ManagementModalNavigation | ManagementRouteOutletContext<T>
  >();
  if (typeof context === "function") {
    return { error: null, isLoading: false, items: [] };
  }
  return context.options;
}
