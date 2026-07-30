import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import type { ScheduleManagementGateway } from "../application/schedule-management-gateway";
import { CancelNotificationDialog } from "../components/CancelNotificationDialog";
import { ScheduleDetailDialog } from "../components/ScheduleDetailDialog";
import { ScheduleManagementTable } from "../components/ScheduleManagementTable";
import { ScheduleSearchToolbar } from "../components/ScheduleSearchToolbar";
import type { ManagedSchedule } from "../model/schedule";
import { filterSchedules } from "../model/schedule-search";

type ScheduleManagementPageProps = {
  gateway: ScheduleManagementGateway;
};

export function ScheduleManagementPage({
  gateway,
}: ScheduleManagementPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationFeedback = readNavigationFeedback(location.state);
  const [schedules, setSchedules] = useState<ManagedSchedule[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] =
    useState<ManagedSchedule | null>(null);
  const [notificationToCancel, setNotificationToCancel] =
    useState<ManagedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(navigationFeedback);

  useEffect(() => {
    if (navigationFeedback) {
      void navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate, navigationFeedback]);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setSchedules(await gateway.list());
    } catch {
      setErrorMessage(
        "イベントを取得できませんでした。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const filteredSchedules = useMemo(
    () => filterSchedules(schedules, query),
    [query, schedules]
  );

  async function handleCancelNotification() {
    if (!notificationToCancel || isDeleting) {
      return;
    }

    const target = notificationToCancel;
    setIsDeleting(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const updatedSchedule = await gateway.cancelNotification(target.id);
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === target.id ? updatedSchedule : schedule
        )
      );
      setSelectedSchedule((current) =>
        current?.id === target.id ? updatedSchedule : current
      );
      setNotificationToCancel(null);
      setFeedbackMessage("未送信の通知予定を削除しました。");
    } catch {
      setErrorMessage(
        "通知予定を削除できませんでした。最新の状態を確認して再度お試しください。"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header>
        <h1 className="text-xl font-semibold">イベント管理</h1>
        <p className="mt-2 text-sm text-[color:var(--text-3)]">
          イベントの開催時間・開催場所・通知設定を管理します
        </p>
      </header>

      <div aria-live="polite" className="mt-4 min-h-5">
        {errorMessage ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--tone-red-text)]">
            <p>{errorMessage}</p>
            {!isLoading ? (
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => void loadSchedules()}
              >
                再読み込み
              </button>
            ) : null}
          </div>
        ) : feedbackMessage ? (
          <p className="text-sm text-[color:var(--tone-green-text)]">
            {feedbackMessage}
          </p>
        ) : null}
      </div>

      <section className="mt-2" aria-label="イベント一覧">
        <ScheduleSearchToolbar
          query={query}
          resultCount={filteredSchedules.length}
          onQueryChange={(nextQuery) => {
            setQuery(nextQuery);
            setFeedbackMessage("");
          }}
        />

        <div className="mt-4">
          {isLoading ? (
            <div
              role="status"
              className="rounded-lg border border-[color:var(--border-2)] bg-[color:var(--surface-overlay-strong)] p-10 text-center text-sm text-[color:var(--text-3)]"
            >
              イベントを読み込んでいます...
            </div>
          ) : errorMessage && schedules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[color:var(--border-2)] p-10 text-center text-sm text-[color:var(--text-3)]">
              一覧を表示できません
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[color:var(--border-2)] p-10 text-center text-sm text-[color:var(--text-3)]">
              {query
                ? "検索条件に一致するイベントはありません"
                : "登録済みのイベントはありません"}
            </div>
          ) : (
            <ScheduleManagementTable
              schedules={filteredSchedules}
              onShowDetail={setSelectedSchedule}
              onCancelNotification={setNotificationToCancel}
            />
          )}
        </div>
      </section>

      {selectedSchedule ? (
        <ScheduleDetailDialog
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      ) : null}

      {notificationToCancel ? (
        <CancelNotificationDialog
          schedule={notificationToCancel}
          isSubmitting={isDeleting}
          onClose={() => setNotificationToCancel(null)}
          onConfirm={handleCancelNotification}
        />
      ) : null}
    </div>
  );
}

function readNavigationFeedback(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "feedbackMessage" in state &&
    typeof state.feedbackMessage === "string"
  ) {
    return state.feedbackMessage;
  }

  return "";
}
