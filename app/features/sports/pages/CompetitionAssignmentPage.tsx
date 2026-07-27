import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { buildBackendUrl } from "~/config/env";

type ClassRoom = {
  class_room_id: number;
  class_name: string;
};

type Student = {
  student_id: number;
  user_id: number;
  display_name: string;
  class_room_id: number;
  attendance_number: number;
  student_id_number: string;
};

type Event = {
  event_id: number;
  event_name: string;
  venue: string;
  start_time: string;
};

type GatheringSpot = {
  gathering_spot_id: number;
  gathering_spot_name: string;
};

type GatheringGroup = {
  gathering_group_id: number;
};

type Gathering = {
  gathering_id: number;
  gathering_group_id: number;
  event_id: number;
  gathering_spot_id: number;
  gathering_time: string;
};

type GatheringGroupMember = {
  user_id: number;
};

type ClassRoomPage = { classrooms: ClassRoom[] };
type StudentPage = { students: Student[] };
type EventPage = { events: Event[] };

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildBackendUrl(path);
  if (!url) {
    throw new Error("バックエンド URL が未設定です。");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String(body.error)
        : `API request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function formatTime(value: string) {
  return /^\d{4}$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : value;
}

export function CompetitionAssignmentPage() {
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gatheringSpots, setGatheringSpots] = useState<GatheringSpot[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedGatheringGroupId, setSelectedGatheringGroupId] =
    useState("new");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const [classRoomPage, studentPage, eventPage, spots, gatheringList] =
          await Promise.all([
            requestApi<ClassRoomPage>("/api/v1/classrooms?limit=100&offset=0"),
            requestApi<StudentPage>("/api/v1/students?limit=100&offset=0"),
            requestApi<EventPage>("/api/v1/events?limit=100&offset=0"),
            requestApi<GatheringSpot[]>("/api/v1/gathering-spots"),
            requestApi<Gathering[]>("/api/v1/gatherings"),
          ]);

        if (!isCurrent) return;

        setClassrooms(classRoomPage.classrooms);
        setStudents(studentPage.students);
        setEvents(eventPage.events);
        setGatheringSpots(spots);
        setGatherings(gatheringList);
        setSelectedClassId(classRoomPage.classrooms[0]?.class_room_id ?? null);
        setSelectedEventId(
          eventPage.events.find((event) =>
            gatheringList.some(
              (gathering) => gathering.event_id === event.event_id
            )
          )?.event_id ??
            eventPage.events[0]?.event_id ??
            null
        );
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "初期データを取得できませんでした。"
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const firstGathering = gatherings.find(
      (gathering) => gathering.event_id === selectedEventId
    );
    setSelectedGatheringGroupId(
      firstGathering ? String(firstGathering.gathering_group_id) : ""
    );
  }, [gatherings, selectedEventId]);

  useEffect(() => {
    let isCurrent = true;

    async function loadMembers() {
      if (!selectedGatheringGroupId || selectedGatheringGroupId === "new") {
        setSelectedUserIds([]);
        return;
      }

      try {
        const members = await requestApi<GatheringGroupMember[]>(
          `/api/v1/gathering-groups/${selectedGatheringGroupId}/members`
        );
        if (isCurrent) {
          setSelectedUserIds(members.map((member) => member.user_id));
        }
      } catch (error) {
        if (isCurrent) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "集合グループのメンバーを取得できませんでした。"
          );
        }
      }
    }

    void loadMembers();
    return () => {
      isCurrent = false;
    };
  }, [selectedGatheringGroupId]);

  const selectedClass = classrooms.find(
    (classroom) => classroom.class_room_id === selectedClassId
  );
  const selectedEvent = events.find(
    (event) => event.event_id === selectedEventId
  );
  const eventGatherings = gatherings.filter(
    (gathering) => gathering.event_id === selectedEventId
  );
  const selectedGathering =
    eventGatherings.find(
      (gathering) =>
        gathering.gathering_group_id === Number(selectedGatheringGroupId)
    ) ?? eventGatherings[0];
  const selectedSpot = gatheringSpots.find(
    (spot) => spot.gathering_spot_id === selectedGathering?.gathering_spot_id
  );
  const gatheringTime = selectedGathering?.gathering_time ?? "";
  const visibleStudents = useMemo(
    () =>
      selectedClassId === null
        ? students
        : students.filter(
            (student) => student.class_room_id === selectedClassId
          ),
    [selectedClassId, students]
  );
  const assignedStudents = useMemo(
    () =>
      students.filter((student) => selectedUserIds.includes(student.user_id)),
    [selectedUserIds, students]
  );

  async function handleSubmit() {
    if (
      !selectedEvent ||
      !selectedSpot ||
      !gatheringTime ||
      selectedUserIds.length === 0
    ) {
      setSubmitError(
        "イベント、実施場所、割り当てメンバーを選択してください。"
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setIsComplete(false);

    try {
      let gatheringGroupId: number;

      if (selectedGatheringGroupId === "new") {
        const newGroup = await requestApi<GatheringGroup>(
          "/api/v1/gathering-groups",
          {
            method: "POST",
          }
        );
        gatheringGroupId = newGroup.gathering_group_id;

        await Promise.all(
          selectedUserIds.map((userId) =>
            requestApi(`/api/v1/gathering-groups/${gatheringGroupId}/members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            })
          )
        );

        await requestApi("/api/v1/gatherings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatheringGroupId,
            eventId: selectedEvent.event_id,
            gatheringSpotId: selectedSpot.gathering_spot_id,
            gatheringTime,
            round: 1,
          }),
        });
      } else {
        gatheringGroupId = Number(selectedGatheringGroupId);
        const currentMembers = await requestApi<GatheringGroupMember[]>(
          `/api/v1/gathering-groups/${gatheringGroupId}/members`
        );
        const currentMemberUserIds = currentMembers.map((m) => m.user_id);

        const toAdd = selectedUserIds.filter(
          (id) => !currentMemberUserIds.includes(id)
        );
        const toRemove = currentMemberUserIds.filter(
          (id) => !selectedUserIds.includes(id)
        );

        await Promise.all([
          ...toAdd.map((userId) =>
            requestApi(`/api/v1/gathering-groups/${gatheringGroupId}/members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            })
          ),
          ...toRemove.map((userId) =>
            requestApi(
              `/api/v1/gathering-groups/${gatheringGroupId}/members/${userId}`,
              { method: "DELETE" }
            )
          ),
        ]);
      }

      setIsComplete(true);
      setGatherings((current) => [
        ...current,
        {
          gathering_id: -gatheringGroupId,
          gathering_group_id: gatheringGroupId,
          event_id: selectedEvent.event_id,
          gathering_spot_id: selectedSpot.gathering_spot_id,
          gathering_time: gatheringTime,
        },
      ]);
      setSelectedGatheringGroupId(String(gatheringGroupId));
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "割り当てを登録できませんでした。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">イベント割り当て 追加</h1>

      {loadError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          初期データの取得に失敗しました: {loadError}
        </p>
      ) : null}

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[480px_minmax(560px,1fr)]">
        <div className="space-y-4">
          <fieldset disabled={isLoading}>
            <legend className="text-sm font-bold">
              クラス <span className="text-red-500">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {classrooms.map((classroom) => (
                <button
                  key={classroom.class_room_id}
                  type="button"
                  onClick={() => setSelectedClassId(classroom.class_room_id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    selectedClassId === classroom.class_room_id
                      ? "border-[#0070bb] bg-[#0070bb]/10 font-bold text-[#0070bb]"
                      : "border-[#d2d2d2] bg-white text-black/50"
                  }`}
                >
                  {classroom.class_name}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-bold">
            イベント <span className="text-red-500">*</span>
            <select
              disabled={isLoading}
              value={selectedEventId ?? ""}
              onChange={(event) =>
                setSelectedEventId(Number(event.target.value))
              }
              className="mt-1 h-[38px] w-full rounded-[10px] border border-[#0070bb] bg-white px-3 font-normal disabled:opacity-50"
            >
              {events.map((event) => (
                <option key={event.event_id} value={event.event_id}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold">
            集合グループ <span className="text-red-500">*</span>
            <select
              disabled={isLoading || eventGatherings.length === 0}
              value={selectedGatheringGroupId}
              onChange={(event) =>
                setSelectedGatheringGroupId(event.target.value)
              }
              className="mt-1 h-[38px] w-full rounded-[10px] border border-[#0070bb] bg-white px-3 font-normal disabled:opacity-50"
            >
              {eventGatherings.length === 0 ? (
                <option value="" disabled>
                  集合グループがありません
                </option>
              ) : (
                eventGatherings.map((gathering) => (
                  <option
                    key={gathering.gathering_group_id}
                    value={gathering.gathering_group_id}
                  >
                    集合グループ #{gathering.gathering_group_id}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["実施場所", selectedSpot?.gathering_spot_name ?? "取得中"],
              [
                "集合時間",
                gatheringTime ? formatTime(gatheringTime) : "未設定",
              ],
              [
                "開始時間",
                selectedEvent ? formatTime(selectedEvent.start_time) : "取得中",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2"
              >
                <p className="text-[10px] text-black/35">{label}</p>
                <p className="mt-0.5 text-xs text-black/45">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-bold">
              割り当てメンバー <span className="text-red-500">*</span>
            </h2>
            <p className="mt-1 text-xs text-black/40">
              学生一覧。チェックで出場メンバーに追加されます。
            </p>
            <div className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                  <tr>
                    <th className="w-10 border-b border-[#d2d2d2] px-3 py-2" />
                    {["学籍番号", "出席番号", "氏名"].map((heading) => (
                      <th
                        key={heading}
                        className="border-b border-[#d2d2d2] px-3 py-2"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((student) => {
                    const checked = selectedUserIds.includes(student.user_id);

                    return (
                      <tr
                        key={student.student_id}
                        className={`border-b border-[#d2d2d2] last:border-b-0 ${
                          checked ? "bg-[#eff6ff]" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            disabled={isLoading || isSubmitting}
                            checked={checked}
                            aria-label={`${student.display_name}を割り当てる`}
                            onChange={() =>
                              setSelectedUserIds((current) =>
                                checked
                                  ? current.filter(
                                      (id) => id !== student.user_id
                                    )
                                  : [...current, student.user_id]
                              )
                            }
                            className="size-4 accent-[#0070bb]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          {student.student_id_number}
                        </td>
                        <td className="px-3 py-2.5">
                          {student.attendance_number}
                        </td>
                        <td className="px-3 py-2.5">{student.display_name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {submitError ? (
            <p className="text-sm text-red-600">{submitError}</p>
          ) : null}
          {isComplete ? (
            <p className="text-sm text-emerald-700">割り当てを登録しました。</p>
          ) : null}

          <div className="flex gap-3 pt-1">
            <Link
              to="/participants"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              disabled={isLoading || isSubmitting}
              onClick={() => void handleSubmit()}
              className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" />
              {isSubmitting ? "登録中..." : "割り当てを登録する"}
            </button>
          </div>
        </div>

        <aside className="min-w-0">
          <p className="text-xs text-black/40">割り当て内容プレビュー</p>
          <dl className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            {[
              ["クラス", selectedClass?.class_name ?? "未選択"],
              ["イベント", selectedEvent?.event_name ?? "未選択"],
              ["実施場所", selectedSpot?.gathering_spot_name ?? "未選択"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center gap-4 border-b border-[#d2d2d2] px-4 py-2.5 last:border-b-0"
              >
                <dt className="w-20 text-xs text-black/40">{label}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-xs text-black/40">割り当てメンバー</p>
          <div className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                <tr>
                  {["通し番号", "学籍番号", "氏名"].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#d2d2d2] px-4 py-2"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map((student, index) => (
                  <tr
                    key={student.student_id}
                    className="border-b border-[#d2d2d2] last:border-b-0"
                  >
                    <td className="px-4 py-2.5">{index + 1}</td>
                    <td className="px-4 py-2.5">{student.student_id_number}</td>
                    <td className="px-4 py-2.5">{student.display_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
