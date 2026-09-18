import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import type {
  ClassRoomOption,
  TeacherRow,
} from "~/features/teachers/model/teacher";
import { getErrorMessage } from "~/lib/client-error";

type UseTeacherClassAssignmentOptions = {
  classRooms: readonly ClassRoomOption[];
  selectedTeacherId: number;
  teachers: readonly TeacherRow[];
};

export function useTeacherClassAssignment({
  classRooms,
  selectedTeacherId,
  teachers,
}: UseTeacherClassAssignmentOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherId, setTeacherId] = useState(selectedTeacherId);
  const [checkedClassRoomIds, setCheckedClassRoomIds] = useState<number[]>(() =>
    findAssignedClassRoomIds(teachers, selectedTeacherId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTeacher = teachers.find(
    (teacher) => teacher.teacherId === teacherId
  );
  const previewClassRoomNames = useMemo(
    () =>
      classRooms
        .filter((classRoom) =>
          checkedClassRoomIds.includes(classRoom.classRoomId)
        )
        .map((classRoom) => classRoom.className),
    [checkedClassRoomIds, classRooms]
  );

  function handleTeacherChange(nextTeacherId: number) {
    setTeacherId(nextTeacherId);
    setCheckedClassRoomIds(findAssignedClassRoomIds(teachers, nextTeacherId));
  }

  function toggleClassRoom(classRoomId: number) {
    setCheckedClassRoomIds((current) =>
      current.includes(classRoomId)
        ? current.filter((id) => id !== classRoomId)
        : [...current, classRoomId]
    );
  }

  async function handleSubmit() {
    if (!selectedTeacher) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await TeacherApi.updateTeacher(teacherId, {
        email: selectedTeacher.email,
        userName: selectedTeacher.displayName,
        classRoomIds: checkedClassRoomIds,
      });
      navigate({ pathname: "/teachers", search: location.search });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "割り当ての登録に失敗しました。時間をおいてもう一度お試しください。"
        )
      );
      setIsSubmitting(false);
    }
  }

  return {
    cancel: () => navigate({ pathname: "/teachers", search: location.search }),
    checkedClassRoomIds,
    errorMessage,
    handleSubmit,
    handleTeacherChange,
    isSubmitting,
    previewClassRoomNames,
    selectedTeacher,
    teacherId,
    toggleClassRoom,
  };
}

function findAssignedClassRoomIds(
  teachers: readonly TeacherRow[],
  teacherId: number
): number[] {
  return (
    teachers
      .find((teacher) => teacher.teacherId === teacherId)
      ?.classRooms.map((classRoom) => classRoom.classRoomId) ?? []
  );
}
