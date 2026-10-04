import { SearchField } from "~/components/ui/form/SearchField";
import { Pagination } from "~/components/ui/navigation/Pagination";
import type {
  StudentPage,
  StudentRow,
} from "~/features/students/model/student";

type StudentClassRoomMembershipPanelProps = {
  classRoomId: number;
  memberPage: StudentPage;
  onMemberPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  search: string;
  searchPage: StudentPage | null;
};

export function StudentClassRoomMembershipPanel({
  classRoomId,
  memberPage,
  onMemberPageChange,
  onSearchChange,
  search,
  searchPage,
}: StudentClassRoomMembershipPanelProps) {
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
        <p className="text-text-muted mt-1 text-sm">
          所属の変更は次の対応で利用できるようになります。
        </p>
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
            items={searchPage?.items ?? []}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <h4 className="text-text-base text-sm font-semibold">所属生徒</h4>
        <StudentMembershipList
          emptyMessage="このクラスに所属する生徒はいません。"
          items={memberPage.items}
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
    </section>
  );
}

function StudentMembershipList({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: readonly StudentRow[];
}) {
  if (items.length === 0) {
    return <p className="text-text-muted py-4 text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="border-border-base divide-border-subtle divide-y rounded-lg border">
      {items.map((student) => (
        <li
          className="grid gap-1 px-4 py-3 sm:grid-cols-[5rem_1fr_8rem] sm:items-center"
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
        </li>
      ))}
    </ul>
  );
}

function StudentSearchResults({
  classRoomId,
  items,
}: {
  classRoomId: number;
  items: readonly StudentRow[];
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
      {items.map((student) => {
        const isMember = student.classRoom?.classRoomId === classRoomId;
        const status = !student.classRoom
          ? "未所属"
          : isMember
            ? "所属済み"
            : `現在: ${student.classRoom.classCode} / ${student.attendanceNumber ?? "—"}番`;
        return (
          <li
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            key={student.studentId}
          >
            <div>
              <p className="text-text-base font-medium">
                {student.displayName}
              </p>
              <p className="text-text-muted text-sm">
                {student.studentIdNumber} · {status}
              </p>
            </div>
            <button
              className="border-border-base text-text-muted rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled
              type="button"
            >
              {isMember
                ? "所属済み"
                : student.classRoom
                  ? "このクラスへ移動"
                  : "このクラスに追加"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
