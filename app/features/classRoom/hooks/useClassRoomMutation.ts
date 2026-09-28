import { useRef, useState } from "react";

import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";
import { getErrorMessage } from "~/lib/client-error";

type UseClassRoomMutationOptions = {
  api: ClassRoomMutationApi;
  onRevalidate?: () => Promise<void> | void;
};

export function useClassRoomMutation({
  api,
  onRevalidate,
}: UseClassRoomMutationOptions) {
  const mutationLock = useRef(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runMutation(
    operation: () => Promise<unknown>,
    fallbackMessage: string,
    shouldRevalidate = false
  ) {
    if (mutationLock.current) return false;

    mutationLock.current = true;
    setIsMutating(true);
    setError(null);
    try {
      await operation();
      if (shouldRevalidate) await onRevalidate?.();
      return true;
    } catch (reason) {
      setError(getErrorMessage(reason, fallbackMessage));
      return false;
    } finally {
      mutationLock.current = false;
      setIsMutating(false);
    }
  }

  function create(input: ClassRoomWriteInput) {
    return runMutation(
      () => api.createClassRoom(input),
      "クラスの登録に失敗しました。"
    );
  }

  function update(classRoomId: number, input: ClassRoomWriteInput) {
    return runMutation(
      () => api.updateClassRoom(classRoomId, input),
      "クラスを保存できませんでした。"
    );
  }

  function remove(classRoomId: number) {
    return runMutation(
      () => api.deleteClassRoom(classRoomId),
      "クラスを削除できませんでした。",
      true
    );
  }

  return {
    clearError: () => setError(null),
    create,
    error,
    isMutating,
    remove,
    update,
  };
}
