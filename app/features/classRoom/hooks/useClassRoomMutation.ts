import { useManagementMutation } from "~/hooks/useManagementMutation";
import type { ClassRoomMutationApi } from "~/features/classRoom/api/contracts/class-room-api";
import type { ClassRoomWriteInput } from "~/features/classRoom/model/classRoom";

type UseClassRoomMutationOptions = {
  api: ClassRoomMutationApi;
  onRevalidate?: () => Promise<void> | void;
};

export function useClassRoomMutation({
  api,
  onRevalidate,
}: UseClassRoomMutationOptions) {
  const { clearError, error, isMutating, run } = useManagementMutation({
    onRevalidate,
  });

  function create(input: ClassRoomWriteInput) {
    return run(
      () => api.createClassRoom(input),
      "クラスの登録に失敗しました。"
    );
  }

  function update(classRoomId: number, input: ClassRoomWriteInput) {
    return run(
      () => api.updateClassRoom(classRoomId, input),
      "クラスを保存できませんでした。"
    );
  }

  function remove(classRoomId: number) {
    return run(
      () => api.deleteClassRoom(classRoomId),
      "クラスを削除できませんでした。",
      true
    );
  }

  return {
    clearError,
    create,
    error,
    isMutating,
    remove,
    update,
  };
}
