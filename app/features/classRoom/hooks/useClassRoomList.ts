import { useCallback, useEffect, useState } from "react";

import type {
  ClassRoomListQuery,
  ClassRoomManagementApi,
} from "~/features/classRoom/api/contracts/class-room-api";
import type {
  ClassRoom,
  ClassRoomPage,
} from "~/features/classRoom/model/classRoom";
import { getErrorMessage } from "~/lib/client-error";

type UseClassRoomListOptions = {
  api: ClassRoomManagementApi;
  initialItems?: readonly ClassRoom[];
  initialTotal?: number;
  onRevalidate?: () => Promise<void> | void;
  query: ClassRoomListQuery;
};

export function useClassRoomList({
  api,
  initialItems,
  initialTotal,
  onRevalidate,
  query,
}: UseClassRoomListOptions) {
  const hasLoaderData = initialItems !== undefined;
  const [fetchedItems, setFetchedItems] = useState<ClassRoom[]>([]);
  const [fetchedTotal, setFetchedTotal] = useState(0);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isFetching, setIsFetching] = useState(!hasLoaderData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasLoaderData) return;
    let isCurrent = true;
    api
      .getClassRoomList(query)
      .then((result) => {
        if (!isCurrent) return;
        setFetchedItems(result.items);
        setFetchedTotal(result.total);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (isCurrent) {
          setError(getErrorMessage(reason, "クラス一覧の取得に失敗しました。"));
        }
      })
      .finally(() => {
        if (isCurrent) setIsFetching(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [api, hasLoaderData, query]);

  const refresh = useCallback(async (): Promise<ClassRoomPage | null> => {
    if (onRevalidate) {
      await onRevalidate();
      return null;
    }

    const result = await api.getClassRoomList(query);
    setFetchedItems(result.items);
    setFetchedTotal(result.total);
    setHasRefreshed(true);
    setError(null);
    return result;
  }, [api, onRevalidate, query]);

  return {
    error,
    isLoading: hasLoaderData ? false : isFetching,
    items:
      hasLoaderData && !hasRefreshed ? [...(initialItems ?? [])] : fetchedItems,
    refresh,
    total:
      hasLoaderData && !hasRefreshed
        ? (initialTotal ?? (initialItems ?? []).length)
        : fetchedTotal,
  };
}
