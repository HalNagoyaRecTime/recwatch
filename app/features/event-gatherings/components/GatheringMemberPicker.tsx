import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";

import { MAX_GATHERING_MEMBERS } from "~/features/event-gatherings/model/event-gathering-settings";
import type { GatheringMemberCandidates } from "~/features/event-gatherings/model/gathering-member-candidate";

type GatheringMemberPickerProps = {
  candidates: GatheringMemberCandidates | null;
  /** 候補または登録済み参加者の読み込み中。どちらかが終わるまで一覧は出さない。 */
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  onCancel: () => void;
  onChange: (userIds: number[]) => void;
  onSave: () => void;
  saveError: string | null;
  selectedUserIds: readonly number[];
};

const ALL_CLASSROOMS = "all";

/**
 * 集合 1 件の参加者を選ぶ。選択状態と保存は呼び出し元が持ち、ここでは候補の絞り込みと
 * チェックの切り替え、保存・キャンセルの操作だけを扱う。
 */
export function GatheringMemberPicker({
  candidates,
  isLoading,
  isSaving,
  loadError,
  onCancel,
  onChange,
  onSave,
  saveError,
  selectedUserIds,
}: GatheringMemberPickerProps) {
  const [classroomId, setClassroomId] = useState(ALL_CLASSROOMS);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // 一覧が下に続いているときだけ、下端にフェードを出して続きがあることを示す
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  // モーダルの下の方で開くと見切れるため、開いた直後に自分が見える位置まで送る
  useEffect(() => {
    const root = rootRef.current;
    if (root && typeof root.scrollIntoView === "function") {
      root.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, []);

  const classroomNames = useMemo(
    () =>
      new Map(
        (candidates?.classrooms ?? []).map((classroom) => [
          classroom.id,
          classroom.name,
        ])
      ),
    [candidates]
  );

  const visibleStudents = useMemo(() => {
    const students = candidates?.students ?? [];
    const keyword = query.trim().toLowerCase();
    return students.filter((student) => {
      // 停止中の学生は新しく追加させない。ただし登録済みの参加者は、外せるように残す。
      if (!student.isLiveActive && !selectedUserIds.includes(student.userId)) {
        return false;
      }
      if (
        classroomId !== ALL_CLASSROOMS &&
        String(student.classroomId) !== classroomId
      ) {
        return false;
      }
      if (!keyword) return true;
      const classroomName = classroomNames.get(student.classroomId) ?? "";
      return [student.name, student.studentNumber, classroomName].some(
        (value) => value.toLowerCase().includes(keyword)
      );
    });
  }, [candidates, classroomId, classroomNames, query, selectedUserIds]);

  // 絞り込みで行数が変わるたびに、続きがあるかを取り直す
  useEffect(() => {
    setHasMoreBelow(hasScrollBelow(listRef.current));
  }, [visibleStudents]);

  // 一括選択で上限を超えることがあるため、黙って打ち切らず保存の手前で止める。
  const isOverLimit = selectedUserIds.length > MAX_GATHERING_MEMBERS;

  const isAllVisibleSelected =
    visibleStudents.length > 0 &&
    visibleStudents.every((student) =>
      selectedUserIds.includes(student.userId)
    );

  function toggle(userId: number) {
    onChange(
      selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId]
    );
  }

  function toggleAllVisible() {
    const visibleIds = visibleStudents.map((student) => student.userId);
    if (isAllVisibleSelected) {
      onChange(selectedUserIds.filter((id) => !visibleIds.includes(id)));
      return;
    }
    onChange([
      ...selectedUserIds,
      ...visibleIds.filter((id) => !selectedUserIds.includes(id)),
    ]);
  }

  return (
    <div
      className="border-border-subtle bg-surface-muted app-rounded space-y-3 border p-3"
      ref={rootRef}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* モーダル内では共有 Select のプルダウンが枠をはみ出すため、既存モーダルと同じネイティブ select を使う */}
        <select
          aria-label="クラスで絞り込み"
          className="app-rounded border-border-base bg-surface-base text-text-base focus:border-border-strong h-9 w-48 shrink-0 border px-3 text-sm outline-none disabled:opacity-50"
          disabled={!candidates}
          onChange={(event) => setClassroomId(event.currentTarget.value)}
          value={classroomId}
        >
          <option value={ALL_CLASSROOMS}>すべてのクラス</option>
          {(candidates?.classrooms ?? []).map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
        <div className="min-w-56 flex-1">
          <SearchField
            ariaLabel="参加者を検索"
            onValueChange={setQuery}
            placeholder="名前・学籍番号・クラスで検索"
            value={query}
          />
        </div>
        <Button
          disabled={visibleStudents.length === 0}
          onClick={toggleAllVisible}
          size="sm"
          type="button"
          variant="secondary"
        >
          {isAllVisibleSelected ? "表示中の選択を解除" : "表示中の全員を選択"}
        </Button>
      </div>

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : isLoading || !candidates ? (
        <p className="text-text-muted text-sm">参加者を読み込み中...</p>
      ) : (
        <div className="relative">
          <div
            className="max-h-64 overflow-x-hidden overflow-y-auto"
            onScroll={(event) =>
              setHasMoreBelow(hasScrollBelow(event.currentTarget))
            }
            ref={listRef}
          >
            {/* 共有 DataTable は内部に横スクロール領域を持ち、モーダル内では 1px の溢れで
                横スクロールバーが出るため、リサイズ不要のここでは素の table で描画する */}
            <table
              aria-label="参加者候補の学生一覧"
              className="border-border-base bg-surface-base app-rounded w-full table-fixed border text-sm"
            >
              <thead className="text-text-muted">
                <tr className="border-border-subtle border-b">
                  <th
                    className="w-14 py-2.5 text-center font-normal"
                    scope="col"
                  >
                    選択
                  </th>
                  <th className="px-3 py-2.5 text-left font-normal" scope="col">
                    氏名
                  </th>
                  <th
                    className="w-32 px-3 py-2.5 text-left font-normal"
                    scope="col"
                  >
                    クラス
                  </th>
                  <th
                    className="w-36 px-3 py-2.5 text-left font-normal"
                    scope="col"
                  >
                    学籍番号
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.length === 0 ? (
                  <tr>
                    <td
                      className="text-text-muted px-3 py-8 text-center"
                      colSpan={4}
                    >
                      条件に一致する学生がいません
                    </td>
                  </tr>
                ) : (
                  visibleStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-border-subtle border-b last:border-b-0"
                    >
                      <td className="py-2 text-center">
                        <input
                          aria-label={`${student.name}を選択`}
                          checked={selectedUserIds.includes(student.userId)}
                          className="accent-brand-primary size-4 align-middle"
                          onChange={() => toggle(student.userId)}
                          type="checkbox"
                        />
                      </td>
                      <td className="text-text-base truncate px-3 py-2 font-semibold">
                        {student.name}
                        {student.isLiveActive ? null : (
                          <span className="app-rounded bg-surface-muted text-text-muted ml-2 px-1.5 py-0.5 text-xs font-medium">
                            停止中
                          </span>
                        )}
                      </td>
                      <td className="text-text-base truncate px-3 py-2">
                        {classroomNames.get(student.classroomId) ?? "—"}
                      </td>
                      <td className="text-text-base truncate px-3 py-2">
                        {student.studentNumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMoreBelow ? (
            <div
              aria-hidden="true"
              className="from-surface-muted pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent"
            />
          ) : null}
        </div>
      )}

      {isOverLimit ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          参加者は{MAX_GATHERING_MEMBERS}人までです。
          {selectedUserIds.length - MAX_GATHERING_MEMBERS}
          人ぶん選択を減らしてください。
        </p>
      ) : null}

      {saveError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-text-base text-sm">
          {candidates ? `${visibleStudents.length}人を表示中` : ""}
          {hasMoreBelow ? "（スクロールで続きを表示）" : ""}
          {candidates
            ? ` ／ 選択中 ${selectedUserIds.length}人 / ${MAX_GATHERING_MEMBERS}人`
            : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={isSaving}
            icon={X}
            onClick={onCancel}
            size="sm"
            type="button"
            variant="secondary"
          >
            キャンセル
          </Button>
          <Button
            disabled={
              isSaving || isLoading || isOverLimit || Boolean(loadError)
            }
            icon={Check}
            onClick={onSave}
            size="sm"
            type="button"
            variant="primary"
          >
            {isSaving ? "保存中..." : "参加者を保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function hasScrollBelow(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
}
