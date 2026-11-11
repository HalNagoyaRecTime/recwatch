import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";

import { GatheringNonStudentMembers } from "~/features/event-gatherings/components/GatheringNonStudentMembers";
import {
  GatheringTeamMemberAdjustment,
  type SelectedTeamMemberGroup,
} from "~/features/event-gatherings/components/GatheringTeamMemberAdjustment";
import type {
  GatheringMemberCandidates,
  MemberNonStudent,
} from "~/features/event-gatherings/model/gathering-member-candidate";
import {
  getTeamSelection,
  updateSelectedTeamMembers,
} from "~/features/event-gatherings/model/gathering-team-selection";

type GatheringMemberPickerProps = {
  candidates: GatheringMemberCandidates | null;
  /** 開いた時点で登録済みだった参加者。停止中の学生を再選択できる状態の維持に使う。 */
  initialUserIds: readonly number[];
  /** 候補または登録済み参加者の読み込み中。どちらかが終わるまで一覧は出さない。 */
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  onCancel: () => void;
  onChange: (userIds: number[]) => void;
  onSave: () => void;
  saveLabel?: string;
  saveError: string | null;
  selectedUserIds: readonly number[];
};

/**
 * 集合1件の参加対象をチーム単位で選ぶ。
 * 選択状態と保存は呼び出し元が持ち、ここでは候補の検索とチーム全員の切り替えを扱う。
 */
export function GatheringMemberPicker({
  candidates,
  initialUserIds,
  isLoading,
  isSaving,
  loadError,
  onCancel,
  onChange,
  onSave,
  saveLabel = "参加者を保存",
  saveError,
  selectedUserIds,
}: GatheringMemberPickerProps) {
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (root && typeof root.scrollIntoView === "function") {
      root.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, []);

  const visibleTeams = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return (candidates?.teams ?? []).filter(
      (team) =>
        !keyword ||
        team.name.toLowerCase().includes(keyword) ||
        team.classCodes.some((classCode) =>
          classCode.toLowerCase().includes(keyword)
        )
    );
  }, [candidates, query]);

  const selectionsByTeamId = useMemo(
    () =>
      new Map(
        (candidates?.teams ?? []).map((team) => [
          team.id,
          getTeamSelection(
            team.id,
            candidates?.students ?? [],
            selectedUserIds
          ),
        ])
      ),
    [candidates, selectedUserIds]
  );

  const selectedTeamCount = Array.from(selectionsByTeamId.values()).filter(
    (selection) =>
      selection.totalCount > 0 &&
      selection.selectedCount === selection.totalCount
  ).length;

  const selectedTeamMemberGroups = useMemo<SelectedTeamMemberGroup[]>(() => {
    if (!candidates) return [];

    const studentsByUserId = new Map(
      candidates.students.map((student) => [student.userId, student])
    );

    return candidates.teams.flatMap((team) => {
      const selection = selectionsByTeamId.get(team.id);
      if (!selection || selection.selectedCount === 0) return [];

      return [
        {
          id: team.id,
          name: team.name,
          students: selection.userIds.flatMap((userId) => {
            const student = studentsByUserId.get(userId);
            return student ? [student] : [];
          }),
        },
      ];
    });
  }, [candidates, selectionsByTeamId]);

  // チームに紐付かない登録済み学生と学生以外の参加者は、既存設定から消さないよう別枠に出す。
  const otherMembers = useMemo(() => {
    const named: MemberNonStudent[] = [];
    let unnamedCount = 0;
    if (!candidates) return { named, unnamedCount };

    const teams = new Set(candidates.teams.map((team) => team.id));
    const students = new Map(
      candidates.students.map((student) => [student.userId, student])
    );

    for (const userId of initialUserIds) {
      const student = students.get(userId);
      if (student) {
        if (
          student.isLiveActive &&
          student.teamId !== null &&
          teams.has(student.teamId)
        ) {
          continue;
        }
        named.push({
          userId,
          name: student.name,
          isLiveActive: student.isLiveActive,
        });
        continue;
      }

      const member = candidates.nonStudents.get(userId);
      if (member) named.push(member);
      else unnamedCount += 1;
    }
    return { named, unnamedCount };
  }, [candidates, initialUserIds]);

  useEffect(() => {
    setHasMoreBelow(hasScrollBelow(listRef.current));
  }, [visibleTeams]);

  function toggleTeam(teamId: number) {
    const selection = selectionsByTeamId.get(teamId);
    if (!selection || selection.totalCount === 0) return;
    onChange(
      updateSelectedTeamMembers(
        selectedUserIds,
        selection.userIds,
        selection.selectedCount < selection.totalCount
      )
    );
  }

  function toggleOtherMember(userId: number) {
    onChange(
      selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId]
    );
  }

  function toggleTeamMember(userId: number) {
    onChange(
      selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId]
    );
  }

  return (
    <div
      className="border-border-subtle bg-surface-muted app-rounded space-y-3 border p-3"
      ref={rootRef}
    >
      <SearchField
        ariaLabel="参加するチームを検索"
        onValueChange={setQuery}
        placeholder="チーム名・クラスコードで検索"
        value={query}
      />

      {loadError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {loadError}
        </p>
      ) : isLoading || !candidates ? (
        <p className="text-text-muted text-sm">参加対象を読み込み中...</p>
      ) : (
        <div className="relative">
          <div
            className="max-h-64 overflow-x-hidden overflow-y-auto"
            onScroll={(event) =>
              setHasMoreBelow(hasScrollBelow(event.currentTarget))
            }
            ref={listRef}
          >
            <table
              aria-label="参加対象のチーム一覧"
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
                    チーム名
                  </th>
                  <th
                    className="w-64 px-3 py-2.5 text-left font-normal"
                    scope="col"
                  >
                    所属クラス
                  </th>
                  <th
                    className="w-32 px-3 py-2.5 text-right font-normal"
                    scope="col"
                  >
                    対象者
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleTeams.length === 0 ? (
                  <tr>
                    <td
                      className="text-text-muted px-3 py-8 text-center"
                      colSpan={4}
                    >
                      条件に一致するチームがありません
                    </td>
                  </tr>
                ) : (
                  visibleTeams.map((team) => {
                    const selection = selectionsByTeamId.get(team.id) ?? {
                      selectedCount: 0,
                      totalCount: 0,
                      userIds: [],
                    };
                    const isSelected =
                      selection.totalCount > 0 &&
                      selection.selectedCount === selection.totalCount;
                    const isPartiallySelected =
                      selection.selectedCount > 0 && !isSelected;

                    return (
                      <tr
                        key={team.id}
                        className="border-border-subtle border-b last:border-b-0"
                      >
                        <td className="py-2 text-center">
                          <input
                            aria-label={`${team.name}を選択`}
                            checked={isSelected}
                            className="accent-brand-primary size-4 align-middle disabled:opacity-50"
                            disabled={selection.totalCount === 0}
                            onChange={() => toggleTeam(team.id)}
                            ref={(element) => {
                              if (element) {
                                element.indeterminate = isPartiallySelected;
                              }
                            }}
                            type="checkbox"
                          />
                        </td>
                        <td className="text-text-base truncate px-3 py-2 font-semibold">
                          {team.name}
                        </td>
                        <td className="text-text-muted px-3 py-2">
                          {team.classCodes.length > 0
                            ? team.classCodes.join("、")
                            : "—"}
                        </td>
                        <td className="text-text-base px-3 py-2 text-right">
                          {selection.selectedCount > 0
                            ? `${selection.selectedCount} / `
                            : ""}
                          {selection.totalCount}人
                        </td>
                      </tr>
                    );
                  })
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

      <GatheringTeamMemberAdjustment
        groups={selectedTeamMemberGroups}
        onToggle={toggleTeamMember}
        selectedUserIds={selectedUserIds}
      />

      {!loadError && !isLoading && candidates ? (
        <GatheringNonStudentMembers
          members={otherMembers.named}
          onToggle={toggleOtherMember}
          selectedUserIds={selectedUserIds}
          unnamedCount={otherMembers.unnamedCount}
        />
      ) : null}

      {saveError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-text-base text-sm">
          {candidates ? `${visibleTeams.length}チームを表示中` : ""}
          {hasMoreBelow ? "（スクロールで続きを表示）" : ""}
          {candidates
            ? ` ／ 選択中 ${selectedTeamCount}チーム・${selectedUserIds.length}人`
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
            disabled={isSaving || isLoading || Boolean(loadError)}
            icon={Check}
            onClick={onSave}
            size="sm"
            type="button"
            variant="primary"
          >
            {isSaving ? "保存中..." : saveLabel}
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
