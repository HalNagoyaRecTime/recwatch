import { FormModal } from "~/components/ui/modal/FormModal";
import { ManagementOptionFeedback } from "~/components/management/ManagementOptionFeedback";
import type {
  StudentAccessMutationApi,
  StudentMutationApi,
} from "~/features/students/api/contracts/student-api";
import { StudentForm } from "~/features/students/components/StudentForm";
import { useStudentMutation } from "~/features/students/hooks/useStudentMutation";
import type { ManagementOptionState } from "~/hooks/useManagementOptions";
import type {
  StudentClassRoomOption,
  StudentWriteInput,
} from "~/features/students/model/student";

type StudentCreatePageProps = {
  api: StudentMutationApi;
  classRooms: readonly StudentClassRoomOption[];
  classRoomOptions?: ManagementOptionState<StudentClassRoomOption>;
  onClose: () => void | Promise<void>;
  onSaved: () => Promise<void>;
  userApi: StudentAccessMutationApi;
};

export function StudentCreatePage({
  api,
  classRoomOptions,
  classRooms,
  onClose,
  onSaved,
  userApi,
}: StudentCreatePageProps) {
  const classRoomOptionState = classRoomOptions ?? {
    error: null,
    isLoading: false,
    items: classRooms,
  };
  const {
    error: submitError,
    isMutating: isSubmitting,
    save,
  } = useStudentMutation({ api, userApi });

  async function handleSubmit(input: StudentWriteInput) {
    if (await save(null, input)) await onSaved();
  }

  return (
    <FormModal
      description="氏名、学籍番号、出席番号、所属クラスを入力します"
      onClose={onClose}
      title="学生の新規登録"
    >
      <ManagementOptionFeedback
        label="クラス候補"
        state={classRoomOptionState}
      />
      {!classRoomOptionState.isLoading && !classRoomOptionState.error ? (
        <StudentForm
          classRooms={classRoomOptionState.items}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      ) : null}
    </FormModal>
  );
}
