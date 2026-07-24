import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TeacherApi } from "~/features/instructors/api";
import type { TeacherRow } from "~/features/instructors/model/teacher";

export type ClassRoomOption = {
  classRoomId: number;
  className: string;
};

export function TeacherClassAssignmentPage({
  teachers,
  classRooms,
  selectedTeacherId,
}: {
  teachers: TeacherRow[];
  classRooms: ClassRoomOption[];
  selectedTeacherId: number;
}) {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState(selectedTeacherId);
  const [checkedClassRoomIds, setCheckedClassRoomIds] = useState<number[]>(() =>
    findAssignedClassRoomIds(teachers, selectedTeacherId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTeacher = teachers.find((t) => t.teacherId === teacherId);

  const previewClassRoomNames = useMemo(() => {
    return classRooms
      .filter((c) => checkedClassRoomIds.includes(c.classRoomId))
      .map((c) => c.className);
  }, [classRooms, checkedClassRoomIds]);

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
        userName: selectedTeacher.displayName,
        isLiveActive: true,
        classRoomIds: checkedClassRoomIds,
      });
      navigate("/instructors");
    } catch {
      setErrorMessage(
        "割り当ての登録に失敗しました。時間をおいてもう一度お試しください。"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">クラス割り当て</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(320px,420px)]">
        <div className="space-y-3">
          <label className="block text-sm font-bold">
            教官名
            <select
              value={teacherId}
              onChange={(e) => handleTeacherChange(Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none"
            >
              {teachers.map((teacher) => (
                <option key={teacher.teacherId} value={teacher.teacherId}>
                  {teacher.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            教官ID
            <select
              value={teacherId}
              onChange={(e) => handleTeacherChange(Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none"
            >
              {teachers.map((teacher) => (
                <option key={teacher.teacherId} value={teacher.teacherId}>
                  {teacher.teacherCode}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm font-bold">
            担当クラス
            <div className="mt-1 max-h-64 space-y-1 overflow-y-auto rounded-[10px] border border-[#0070bb] bg-white p-2">
              {classRooms.map((classRoom) => (
                <label
                  key={classRoom.classRoomId}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-[#f7faff]"
                >
                  <input
                    type="checkbox"
                    checked={checkedClassRoomIds.includes(
                      classRoom.classRoomId
                    )}
                    onChange={() => toggleClassRoom(classRoom.classRoomId)}
                    className="size-4"
                  />
                  {classRoom.className}
                </label>
              ))}
            </div>
          </div>
          {errorMessage ? (
            <p className="text-xs text-red-600">{errorMessage}</p>
          ) : null}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/instructors")}
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedTeacher}
              className="rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSubmitting ? "登録中..." : "割り当てを登録する"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold text-black/40">
            割り当て内容プレビュー
          </div>
          <div className="overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            <div className="flex border-b border-[#d2d2d2] px-4 py-3 text-sm">
              <span className="w-24 text-black/40">教官名</span>
              <span className="font-bold">
                {selectedTeacher?.displayName ?? "-"}
              </span>
            </div>
            <div className="flex border-b border-[#d2d2d2] px-4 py-3 text-sm">
              <span className="w-24 text-black/40">教官ID</span>
              <span className="font-bold">
                {selectedTeacher?.teacherCode ?? "-"}
              </span>
            </div>
            <div className="flex px-4 py-3 text-sm">
              <span className="w-24 shrink-0 text-black/40">担当クラス</span>
              <span className="font-bold whitespace-pre-line">
                {previewClassRoomNames.length > 0
                  ? previewClassRoomNames.join("\n")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                <tr>
                  {["教官ID", "教官名", "担当クラス"].map((h) => (
                    <th key={h} className="border-b border-[#d2d2d2] px-4 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedTeacher ? (
                  <tr>
                    <td className="px-4 py-3">{selectedTeacher.teacherCode}</td>
                    <td className="px-4 py-3">{selectedTeacher.displayName}</td>
                    <td className="px-4 py-3 whitespace-pre-line">
                      {previewClassRoomNames.length > 0
                        ? previewClassRoomNames.join("\n")
                        : "-"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function findAssignedClassRoomIds(
  teachers: TeacherRow[],
  teacherId: number
): number[] {
  return (
    teachers
      .find((t) => t.teacherId === teacherId)
      ?.classRooms.map((c) => c.classRoomId) ?? []
  );
}
