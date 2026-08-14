import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { TeacherApi } from "~/features/teachers/api";
import type { TeacherRow } from "~/features/teachers/model/teacher";

type UseTeacherClassAssignmentOptions = {
  classRooms: readonly { classRoomId: number; className: string }[];
  selectedTeacherId: number;
  teachers: readonly TeacherRow[];
};

export function useTeacherClassAssignment({
  classRooms,
  selectedTeacherId,
  teachers,
}: UseTeacherClassAssignmentOptions) {
  const navigate = useNavigate();
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
      await TeacherApi.updateTeacherAssignment(teacherId, {
        userName: selectedTeacher.displayName,
        isLiveActive: selectedTeacher.isLiveActive,
        classRoomIds: checkedClassRoomIds,
      });
      navigate("/teachers");
    } catch {
      setErrorMessage(
        "割り当ての登録に失敗しました。時間をおいてもう一度お試しください。"
      );
      setIsSubmitting(false);
    }
  }

  return {
    cancel: () => navigate("/teachers"),
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
