import {
  Check,
  Clock3,
  Flag,
  ListFilter,
  Loader2,
  MapPin,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import type { CompetitionAssignmentGateway } from "../api/competition-assignment-gateway";
import { httpCompetitionAssignmentGateway } from "../api/http-competition-assignment-gateway";
import { AssignmentSection } from "../components/AssignmentSection";
import { AssignmentStudentTable } from "../components/AssignmentStudentTable";
import type { CompetitionAssignmentData } from "../model/competition-assignment";

type CompetitionAssignmentPageProps = {
  gateway?: CompetitionAssignmentGateway;
};

const emptyData: CompetitionAssignmentData = {
  classrooms: [],
  students: [],
  events: [],
  spots: [],
  gatherings: [],
};

export function CompetitionAssignmentPage({
  gateway = httpCompetitionAssignmentGateway,
}: CompetitionAssignmentPageProps) {
  const [searchParams] = useSearchParams();
  const requestedEventId = parsePositiveInteger(searchParams.get("eventId"));
  const requestedGatheringId = parsePositiveInteger(
    searchParams.get("gatheringId")
  );
  const [data, setData] = useState(emptyData);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(
    null
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedGatheringId, setSelectedGatheringId] = useState<number | null>(
    null
  );
  const [newSpotId, setNewSpotId] = useState<number | null>(null);
  const [newGatheringTime, setNewGatheringTime] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    gateway
      .load()
      .then((loaded) => {
        if (!active) return;
        setData(loaded);
        setSelectedClassroomId(loaded.classrooms[0]?.id ?? null);
        setNewSpotId(loaded.spots[0]?.id ?? null);

        const requestedEventExists = loaded.events.some(
          (event) => event.id === requestedEventId
        );
        const initialEventId = requestedEventExists
          ? requestedEventId
          : (loaded.events.find((event) =>
              loaded.gatherings.some(
                (gathering) => gathering.eventId === event.id
              )
            )?.id ??
            loaded.events[0]?.id ??
            null);
        const initialGatherings = loaded.gatherings.filter(
          (gathering) => gathering.eventId === initialEventId
        );
        setSelectedEventId(initialEventId);
        setSelectedGatheringId(
          initialGatherings.some(
            (gathering) => gathering.id === requestedGatheringId
          )
            ? requestedGatheringId
            : (initialGatherings[0]?.id ?? null)
        );
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "参加者設定に必要なデータを取得できませんでした。"
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gateway, requestedEventId, requestedGatheringId]);

  const eventGatherings = useMemo(
    () =>
      data.gatherings.filter(
        (gathering) => gathering.eventId === selectedEventId
      ),
    [data.gatherings, selectedEventId]
  );

  useEffect(() => {
    let active = true;

    if (selectedGatheringId === null) {
      return () => {
        active = false;
      };
    }

    gateway
      .loadMemberUserIds(selectedGatheringId)
      .then((userIds) => {
        if (active) setSelectedUserIds(userIds);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSubmitError(
          error instanceof Error
            ? error.message
            : "集合予定のメンバーを取得できませんでした。"
        );
      });

    return () => {
      active = false;
    };
  }, [gateway, selectedGatheringId]);

  const selectedEvent = data.events.find(
    (event) => event.id === selectedEventId
  );
  const selectedGathering = eventGatherings.find(
    (gathering) => gathering.id === selectedGatheringId
  );
  const selectedSpotId = selectedGathering?.spotId ?? newSpotId;
  const selectedSpot = data.spots.find((spot) => spot.id === selectedSpotId);
  const gatheringTime = selectedGathering?.time ?? newGatheringTime;
  const visibleStudents = useMemo(
    () =>
      selectedClassroomId === null
        ? data.students
        : data.students.filter(
            (student) => student.classroomId === selectedClassroomId
          ),
    [data.students, selectedClassroomId]
  );
  function selectGathering(value: string) {
    setSelectedGatheringId(value === "new" ? null : Number(value));
    setSelectedUserIds([]);
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function selectEvent(eventId: number) {
    const firstGathering = data.gatherings.find(
      (gathering) => gathering.eventId === eventId
    );
    setSelectedEventId(eventId);
    setSelectedGatheringId(firstGathering?.id ?? null);
    setSelectedUserIds([]);
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function toggleStudent(userId: number) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
    setSuccessMessage(null);
  }

  async function saveAssignment() {
    if (isSubmitting) return;

    if (
      !selectedEvent ||
      !selectedSpot ||
      !gatheringTime ||
      selectedUserIds.length === 0
    ) {
      setSubmitError(
        "イベント、集合場所、集合時間、参加者を選択してください。"
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const result = await gateway.save({
        eventId: selectedEvent.id,
        gatheringId: selectedGatheringId,
        spotId: selectedSpot.id,
        time: gatheringTime,
        userIds: selectedUserIds,
      });
      setData((current) => ({
        ...current,
        gatherings: current.gatherings.some(
          (gathering) => gathering.id === result.gathering.id
        )
          ? current.gatherings
          : [...current.gatherings, result.gathering],
      }));
      setSelectedGatheringId(result.gathering.id);
      setSuccessMessage("参加者設定を保存しました。");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "参加者設定を保存できませんでした。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full space-y-6">
      <PageHeader title="参加者設定" />

      {loadError ? (
        <p
          className="app-rounded border-tone-danger-border bg-tone-danger-bg text-tone-danger-text border px-4 py-3 text-sm"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {isLoading ? (
        <div
          className="text-text-muted flex min-h-48 items-center justify-center gap-2 text-sm"
          role="status"
        >
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          読み込み中...
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          <form
            className="min-w-0 space-y-7"
            onSubmit={(event) => {
              event.preventDefault();
              void saveAssignment();
            }}
          >
            <AssignmentSection icon={ListFilter} title="対象を選択">
              <div className="grid gap-4 md:grid-cols-3">
                <label className={labelClassName}>
                  クラス <RequiredMark />
                  <select
                    aria-label="クラス"
                    className={inputClassName}
                    disabled={isSubmitting || data.classrooms.length === 0}
                    onChange={(event) => {
                      setSelectedClassroomId(Number(event.currentTarget.value));
                      setSuccessMessage(null);
                    }}
                    value={selectedClassroomId ?? ""}
                  >
                    {data.classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClassName}>
                  イベント <RequiredMark />
                  <select
                    aria-label="イベント"
                    className={inputClassName}
                    disabled={isSubmitting || data.events.length === 0}
                    onChange={(event) => {
                      selectEvent(Number(event.currentTarget.value));
                    }}
                    value={selectedEventId ?? ""}
                  >
                    {data.events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClassName}>
                  集合予定 <RequiredMark />
                  <select
                    aria-label="集合予定"
                    className={inputClassName}
                    disabled={isSubmitting || !selectedEvent}
                    onChange={(event) =>
                      selectGathering(event.currentTarget.value)
                    }
                    value={selectedGatheringId ?? "new"}
                  >
                    <option value="new">新しい集合予定</option>
                    {eventGatherings.map((gathering) => (
                      <option key={gathering.id} value={gathering.id}>
                        {formatTime(gathering.time)} / 集合予定 #{gathering.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </AssignmentSection>

            <AssignmentSection
              aside={
                selectedGathering ? (
                  <span className="text-text-muted text-xs font-medium">
                    登録済み
                  </span>
                ) : (
                  <span className="text-brand-primary text-xs font-medium">
                    新規
                  </span>
                )
              }
              icon={MapPin}
              title="集合情報"
            >
              {selectedGathering ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <ReadOnlyValue
                    icon={MapPin}
                    label="集合場所"
                    value={selectedSpot?.name}
                  />
                  <ReadOnlyValue
                    icon={Clock3}
                    label="集合時間"
                    value={formatTime(selectedGathering.time)}
                  />
                  <ReadOnlyValue
                    icon={Flag}
                    label="開始時刻"
                    value={selectedEvent?.startTime}
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClassName}>
                    集合場所 <RequiredMark />
                    <select
                      aria-label="集合場所"
                      className={inputClassName}
                      disabled={isSubmitting || data.spots.length === 0}
                      onChange={(event) =>
                        setNewSpotId(Number(event.currentTarget.value))
                      }
                      value={newSpotId ?? ""}
                    >
                      {data.spots.map((spot) => (
                        <option key={spot.id} value={spot.id}>
                          {spot.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClassName}>
                    集合時間 <RequiredMark />
                    <input
                      aria-label="集合時間"
                      className={inputClassName}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setNewGatheringTime(event.currentTarget.value)
                      }
                      type="time"
                      value={newGatheringTime}
                    />
                  </label>
                  <ReadOnlyValue
                    icon={Flag}
                    label="開始時刻"
                    value={selectedEvent?.startTime}
                  />
                </div>
              )}
            </AssignmentSection>

            <AssignmentSection
              aside={
                <span className="text-text-muted text-xs font-medium">
                  {selectedUserIds.length}名選択中
                </span>
              }
              footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-5">
                    {submitError ? (
                      <p className="text-tone-danger-text text-sm" role="alert">
                        {submitError}
                      </p>
                    ) : null}
                    {successMessage ? (
                      <p
                        className="text-tone-success-text text-sm"
                        role="status"
                      >
                        {successMessage}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 justify-end gap-3">
                    <ButtonLink to="/events" variant="secondary">
                      キャンセル
                    </ButtonLink>
                    <Button
                      disabled={isSubmitting || Boolean(loadError)}
                      icon={Check}
                      type="submit"
                      variant="primary"
                    >
                      {isSubmitting ? "保存中..." : "設定を保存"}
                    </Button>
                  </div>
                </div>
              }
              icon={UsersRound}
              title="参加者"
            >
              <AssignmentStudentTable
                disabled={isSubmitting}
                onToggle={toggleStudent}
                selectedUserIds={selectedUserIds}
                students={visibleStudents}
              />
            </AssignmentSection>
          </form>
        </div>
      )}
    </div>
  );
}

function ReadOnlyValue({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3">
      <Icon aria-hidden="true" className="text-text-subtle size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-text-subtle text-xs">{label}</p>
        <p className="text-text-base mt-0.5 truncate text-sm font-semibold">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-tone-danger-text">
      *
    </span>
  );
}

function formatTime(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

function parsePositiveInteger(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

const labelClassName = "text-text-base block text-sm font-medium";
const inputClassName =
  "app-rounded border-border-base bg-surface-base text-text-base focus:border-border-strong mt-1.5 h-10 w-full border px-3 text-sm outline-none disabled:opacity-50";
