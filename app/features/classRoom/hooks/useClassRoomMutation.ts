import { useState } from "react";

import type { ClassRoomManagementApi } from "~/features/classRoom/api/contracts/class-room-api";
import type {
  ClassRoomPage,
  ClassRoomWriteInput,
} from "~/features/classRoom/model/classRoom";
import { getErrorMessage } from "~/lib/client-error";

type UseClassRoomMutationOptions = {
  api: ClassRoomManagementApi;
  refresh?: () => Promise<ClassRoomPage | null>;
};

export function useClassRoomMutation({
  api,
  refresh,
}: UseClassRoomMutationOptions) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshAfterMutation() {
    await refresh?.();
  }

  async function create(input: ClassRoomWriteInput) {
    if (isMutating) return false;

    setIsMutating(true);
    setError(null);
    try {
      await api.createClassRoom(input);
      await refreshAfterMutation();
      return true;
    } catch (reason) {
      setError(getErrorMessage(reason, "クラスの登録に失敗しました。"));
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  async function update(classRoomId: number, input: ClassRoomWriteInput) {
    if (isMutating) return false;

    setIsMutating(true);
    setError(null);
    try {
      await api.updateClassRoom(classRoomId, input);
      await refreshAfterMutation();
      return true;
    } catch (reason) {
      setError(getErrorMessage(reason, "クラスを保存できませんでした。"));
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  async function remove(classRoomId: number) {
    if (isMutating) return null;

    setIsMutating(true);
    setError(null);
    try {
      await api.deleteClassRoom(classRoomId);
      return await refresh?.();
    } catch (reason) {
      setError(getErrorMessage(reason, "クラスを削除できませんでした。"));
      return null;
    } finally {
      setIsMutating(false);
    }
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
