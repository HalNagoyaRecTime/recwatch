import { useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type { StudentMutationApi } from "~/features/students/api/contracts/student-api";
import { StudentForm } from "~/features/students/components/StudentForm";
import { useStudentClassRoomMembership } from "~/features/students/hooks/useStudentClassRoomMembership";
import type {
  StudentClassRoomOption,
  StudentPage,
  StudentRow,
} from "~/features/students/model/student";

type StudentClassRoomMembershipPanelProps = {
  api: StudentMutationApi;
  classRoom: StudentClassRoomOption;
  classRoomId: number;
  memberPage: StudentPage;
  onMemberPageChange: (page: number) => void;
  onRevalidate: () => Promise<void> | void;
  onSearchChange: (search: string) => void;
  search: string;
  searchPage: StudentPage | null;
};

export function StudentClassRoomMembershipPanel({
  api,
  classRoom,
  classRoomId,
  memberPage,
  onMemberPageChange,
  onRevalidate,
  onSearchChange,
  search,
  searchPage,
}: StudentClassRoomMembershipPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { createStudent, error, isMutating, updateClassRoom } =
    useStudentClassRoomMembership({ api, onRevalidate });
  const currentPage = Math.floor(memberPage.offset / memberPage.limit) + 1;
  const pageCount = Math.max(1, Math.ceil(memberPage.total / memberPage.limit));

  return (
    <section aria-labelledby="classroom-members-heading" className="space-y-5">
      <div>
        <h3
          className="text-text-base text-base font-semibold"
          id="classroom-members-heading"
        >
          所属メンバー {memberPage.total}人
        </h3>
      </div>

      <div className="space-y-2">
        <SearchField
          ariaLabel="追加する生徒を検索"
          onValueChange={onSearchChange}
          placeholder="氏名・学籍番号・クラスで検索..."
          value={search}
        />
        {search ? (
          <StudentSearchResults
            classRoomId={classRoomId}
            isMutating={isMutating}
            items={searchPage?.items ?? []}
            onAssign={async (student, attendanceNumber) => {
              if (
                student.classRoom &&
                !window.confirm(
                  `${student.displayName}を${student.classRoom.classCode}からこのクラスへ移動しますか？`
                )
              ) {
                return;
              }
              await updateClassRoom(student.studentId, {
                attendanceNumber,
                classRoomId,
              });
            }}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <h4 className="text-text-base text-sm font-semibold">所属生徒</h4>
        <StudentMembershipList
          emptyMessage="このクラスに所属する生徒はいません。"
          isMutating={isMutating}
          items={memberPage.items}
          onUnassign={async (student) => {
            if (
              !window.confirm(`${student.displayName}をクラスから外しますか？`)
            ) {
              return;
            }
            await updateClassRoom(student.studentId, {
              attendanceNumber: null,
              classRoomId: null,
            });
          }}
        />
        {memberPage.total > memberPage.limit ? (
          <Pagination
            currentPage={currentPage}
            onPageChange={onMemberPageChange}
            pageCount={pageCount}
            pageSize={memberPage.limit}
            totalItems={memberPage.total}
          />
        ) : null}
      </div>

      {error ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="border-border-base border-t pt-4">
        {isCreateOpen ? (
          <StudentForm
            classRooms={[classRoom]}
            fixedClassRoom={classRoom}
            isSubmitting={isMutating}
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={async (input) => {
              if (await createStudent(input)) setIsCreateOpen(false);
            }}
            submitError={error}
          />
        ) : (
          <Button
            disabled={isMutating}
            onClick={() => setIsCreateOpen(true)}
            type="button"
            variant="secondary"
          >
            新しい生徒を登録
          </Button>
        )}
      </div>
    </section>
  );
}

function StudentMembershipList({
  emptyMessage,
  isMutating,
  items,
  onUnassign,
}: {
  emptyMessage: string;
  isMutating: boolean;
  items: readonly StudentRow[];
  onUnassign: (student: StudentRow) => void;
}) {
  if (items.length === 0) {
    return <p className="text-text-muted py-4 text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="border-border-base divide-border-subtle divide-y rounded-lg border">
      {items.map((student) => (
        <li
          className="grid gap-2 px-4 py-3 sm:grid-cols-[5rem_1fr_8rem_auto] sm:items-center"
          key={student.studentId}
        >
          <span className="text-text-muted text-sm">
            {student.attendanceNumber ?? "—"}番
          </span>
          <span className="text-text-base font-medium">
            {student.displayName}
          </span>
          <span className="text-text-muted text-sm sm:text-right">
            {student.studentIdNumber}
          </span>
          <Button
            disabled={isMutating}
            onClick={() => onUnassign(student)}
            size="sm"
            type="button"
            variant="secondary"
          >
            クラスから外す
          </Button>
        </li>
      ))}
    </ul>
  );
}

function StudentSearchResults({
  classRoomId,
  isMutating,
  items,
  onAssign,
}: {
  classRoomId: number;
  isMutating: boolean;
  items: readonly StudentRow[];
  onAssign: (student: StudentRow, attendanceNumber: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-text-muted rounded-lg py-3 text-sm">
        検索条件に一致する生徒が見つかりません。
      </p>
    );
  }

  return (
    <ul
      aria-label="生徒の検索結果"
      className="border-border-base divide-border-subtle divide-y rounded-lg border"
    >
      {items.map((student) => (
        <StudentSearchResult
          classRoomId={classRoomId}
          isMutating={isMutating}
          key={student.studentId}
          onAssign={onAssign}
          student={student}
        />
      ))}
    </ul>
  );
}

function StudentSearchResult({
  classRoomId,
  isMutating,
  onAssign,
  student,
}: {
  classRoomId: number;
  isMutating: boolean;
  onAssign: (student: StudentRow, attendanceNumber: number) => void;
  student: StudentRow;
}) {
  const [attendanceNumber, setAttendanceNumber] = useState("");
  const isMember = student.classRoom?.classRoomId === classRoomId;
  const parsedAttendanceNumber = Number(attendanceNumber);
  const canAssign =
    !isMember &&
    Number.isInteger(parsedAttendanceNumber) &&
    parsedAttendanceNumber > 0;
  const status = !student.classRoom
    ? "未所属"
    : isMember
      ? "所属済み"
      : `現在: ${student.classRoom.classCode} / ${student.attendanceNumber ?? "—"}番`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-text-base font-medium">{student.displayName}</p>
        <p className="text-text-muted text-sm">
          {student.studentIdNumber} · {status}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isMember ? (
          <input
            aria-label={`${student.displayName}の新しい出席番号`}
            className="border-border-base bg-surface-base text-text-base h-9 w-24 rounded-md border px-3 text-sm"
            disabled={isMutating}
            min={1}
            onChange={(event) => setAttendanceNumber(event.currentTarget.value)}
            placeholder="出席番号"
            type="number"
            value={attendanceNumber}
          />
        ) : null}
        <Button
          disabled={isMutating || !canAssign}
          onClick={() => onAssign(student, parsedAttendanceNumber)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {isMember
            ? "所属済み"
            : student.classRoom
              ? "このクラスへ移動"
              : "このクラスに追加"}
        </Button>
      </div>
    </li>
  );
}
