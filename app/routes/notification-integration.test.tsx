import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationsNewRoute from "~/routes/main/notifications.new";
import NotificationsRoute from "~/routes/main/notifications";
import NotificationDetailRoute from "~/routes/main/notifications.$notificationId";
import NotificationEditRoute from "~/routes/main/notifications.$notificationId.edit";
import { FeedbackProvider } from "~/features/frame/feedback/components/FeedbackProvider";
import { FeedbackToastHost } from "~/features/frame/feedback/components/FeedbackToastHost";
import { AppNotificationCenter } from "~/features/frame/feedback/components/AppNotificationCenter";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  cloneFixture,
  notificationConfigFixture,
  notificationScheduleDetailFixture,
} from "~/features/notifications/mock/notification-fixtures";
import type {
  NotificationCreateRequest,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-command-api";

const base = "/api/v1/admin/notifications";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
// HTTPだけを置換し、Routeの本番adapter・Mapper・共通apiClientはそのまま使用します。
function mockTransport(createStatus = 200) {
  const detail = cloneFixture(adminNotificationDetailFixture);
  detail.schedules = [
    {
      ...cloneFixture(adminNotificationListFixture.items[0].schedules[0]),
      stop: null,
    },
  ];
  detail.schedules[0].sendAt = new Date(Date.now() + 600_000).toISOString();
  let exists = false;
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (
        ["/api/v1/classrooms", "/api/v1/students", "/api/v1/teachers"].includes(
          url.pathname
        )
      )
        return json({ items: [], total: 0, limit: 100, offset: 0 });
      if (url.pathname === "/api/v1/events")
        return json({ events: [], total: 0, limit: 100, offset: 0 });
      if (url.pathname === `${base}/config`)
        return json(notificationConfigFixture);
      if (url.pathname === `${base}/audience-count`)
        return json({ recipientCount: 7 });
      if (url.pathname === base && method === "POST") {
        if (createStatus === 0) throw new Error("検証用の通信断");
        if (createStatus !== 200)
          return json(
            {
              error: {
                code:
                  createStatus === 400
                    ? "VALIDATION_ERROR"
                    : createStatus === 500
                      ? "INTERNAL_SERVER_ERROR"
                      : "NOTIFICATION_EDIT_NOT_ALLOWED",
                message: "操作を完了できませんでした",
                ...(createStatus === 400
                  ? {
                      details: {
                        fieldErrors: {
                          content: ["通知内容を確認してください"],
                        },
                        formErrors: [],
                      },
                    }
                  : {}),
              },
            },
            createStatus
          );
        const request = JSON.parse(
          String(init?.body)
        ) as NotificationCreateRequest;
        detail.content = request.content;
        if (request.delivery.type === "scheduled")
          detail.schedules[0].sendAt = new Date(
            request.delivery.sendAt
          ).toISOString();
        exists = true;
        return json(
          {
            notificationId: detail.notificationId,
            notificationScheduleId: detail.schedules[0].notificationScheduleId,
          },
          201
        );
      }
      if (url.pathname === base)
        return json({
          items: exists
            ? [
                {
                  notificationId: detail.notificationId,
                  content: { push: detail.content.push },
                  importance: detail.importance,
                  creation: detail.creation,
                  createdAt: detail.createdAt,
                  schedules: detail.schedules.map((schedule) => ({
                    notificationScheduleId: schedule.notificationScheduleId,
                    sendAt: schedule.sendAt,
                    status: schedule.status,
                    scheduledBy: schedule.scheduledBy,
                    createdAt: schedule.createdAt,
                    audience: schedule.audience,
                    recipientPushSummary: schedule.recipientPushSummary,
                  })),
                },
              ]
            : [],
        });
      if (url.pathname === `${base}/${detail.notificationId}`) {
        if (method === "DELETE") {
          exists = false;
          return new Response(null, { status: 204 });
        }
        if (method === "PATCH") {
          const request = JSON.parse(
            String(init?.body)
          ) as NotificationPatchRequest;
          detail.content = {
            push: { ...detail.content.push, ...request.content?.push },
            detail: { ...detail.content.detail, ...request.content?.detail },
          };
        }
        return exists
          ? json(detail)
          : json(
              {
                error: {
                  code: "ADMIN_NOTIFICATION_NOT_FOUND",
                  message: "通知がありません",
                },
              },
              404
            );
      }
      if (
        url.pathname ===
        `${base}/schedules/${detail.schedules[0].notificationScheduleId}`
      )
        return json({
          ...cloneFixture(notificationScheduleDetailFixture),
          notificationScheduleId: detail.schedules[0].notificationScheduleId,
          notificationId: detail.notificationId,
          status: "scheduled",
          content: { push: detail.content.push },
        });
      throw new Error(`想定外のHTTP要求: ${method} ${url.pathname}`);
    }
  );
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, detail };
}
function renderRoutes(path = "/notifications/new") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FeedbackProvider userId="notification-integration-synthetic">
        <Routes>
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route
            path="/notifications/new"
            element={<NotificationsNewRoute />}
          />
          <Route
            path="/notifications/:notificationId"
            element={<NotificationDetailRoute />}
          />
          <Route
            path="/notifications/:notificationId/edit"
            element={<NotificationEditRoute />}
          />
        </Routes>
        <section aria-label="Toast">
          <FeedbackToastHost />
        </section>
        <section aria-label="操作通知履歴">
          <AppNotificationCenter />
        </section>
      </FeedbackProvider>
    </MemoryRouter>
  );
}
function fillContent() {
  for (const [label, value] of [
    ["タイトル*", "統合確認の通知"],
    ["本文*", "検証用の本文"],
    ["詳細タイトル*", "統合確認の詳細"],
    ["詳細本文*", "検証用の詳細本文"],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("通知RouteのHTTP境界統合（応答はMock）", () => {
  it.each(["now", "scheduled"] as const)(
    "%s作成から詳細・一覧・編集・削除まで遷移し、成功はToastのみへ通知する",
    async (timing) => {
      const user = userEvent.setup();
      const { fetchMock, detail } = mockTransport();
      renderRoutes();
      fillContent();
      if (timing === "scheduled") {
        await user.click(screen.getByRole("button", { name: "予約配信" }));
        const future = new Date(Date.now() + 600_000);
        fireEvent.change(screen.getByLabelText("予約配信日時"), {
          target: {
            value: new Date(
              future.getTime() - future.getTimezoneOffset() * 60_000
            )
              .toISOString()
              .slice(0, 16),
          },
        });
      }

      await screen.findByText("対象候補 7人");
      const submit = screen.getByRole("button", {
        name: timing === "scheduled" ? "配信を予約" : "通知を配信",
      });
      await waitFor(() => expect(submit).toBeEnabled());
      await user.click(submit);
      await screen.findByRole("heading", { name: "統合確認の詳細" });
      expect(
        within(screen.getByRole("region", { name: "Toast" })).getByText(
          "通知を登録しました"
        )
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole("region", { name: "操作通知履歴" })).getByText(
          "通知はありません"
        )
      ).toBeInTheDocument();
      await user.click(screen.getByRole("link", { name: "通知一覧" }));
      await screen.findByRole("heading", { name: "通知一覧" });
      if (timing === "scheduled") {
        await user.click(
          screen.getByRole("button", { name: "カレンダー表示" })
        );
        const link = await screen.findByRole("link", {
          name: /統合確認の通知の詳細を表示/,
        });
        expect(
          fetchMock.mock.calls.some(([url]) =>
            new URL(String(url)).searchParams.has("from")
          )
        ).toBe(true);
        await user.click(link);
        await screen.findByRole("heading", { name: "統合確認の詳細" });
        await user.click(screen.getByRole("link", { name: "通知一覧" }));
        await screen.findByRole("heading", { name: "通知一覧" });
      }
      await user.click(
        await screen.findByRole("button", {
          name: "統合確認の通知のその他の操作",
        })
      );
      await user.click(screen.getByRole("button", { name: "通知を編集" }));
      const title = await screen.findByLabelText("詳細タイトル*");
      fireEvent.change(title, { target: { value: "編集後の詳細" } });
      await user.click(screen.getByRole("button", { name: "変更を保存" }));
      await screen.findByRole("heading", { name: "編集後の詳細" });
      await user.click(screen.getByRole("button", { name: "通知を削除" }));
      await user.click(
        within(screen.getByRole("alertdialog")).getByRole("button", {
          name: "削除する",
        })
      );
      await screen.findByRole("heading", { name: "通知一覧" });
      await screen.findByText("条件に一致する通知はありません");
      const createCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          new URL(String(url)).pathname === base && init?.method === "POST"
      );
      expect(JSON.parse(String(createCall?.[1]?.body)).delivery).toEqual(
        timing === "scheduled"
          ? { type: "scheduled", sendAt: expect.any(String) }
          : { type: "immediate", sendAt: null }
      );
      const mutations = fetchMock.mock.calls.filter(([, init]) =>
        ["POST", "PATCH", "DELETE"].includes(init?.method ?? "")
      );
      expect(
        mutations.some(
          ([url, init]) =>
            new URL(String(url)).pathname === base && init?.method === "POST"
        )
      ).toBe(true);
      expect(
        mutations.some(
          ([url, init]) =>
            new URL(String(url)).pathname ===
              `${base}/${detail.notificationId}` && init?.method === "PATCH"
        )
      ).toBe(true);
      expect(mutations.some(([, init]) => init?.method === "DELETE")).toBe(
        true
      );
      expect(
        within(screen.getByRole("region", { name: "操作通知履歴" })).getByText(
          "通知はありません"
        )
      ).toBeInTheDocument();
    }
  );

  it.each([400, 409, 500, 0])(
    "作成HTTP %sで入力を保持し、400だけはToast・Centerへ保存しない",
    async (status) => {
      const user = userEvent.setup();
      mockTransport(status);
      renderRoutes();
      fillContent();
      const submit = screen.getByRole("button", { name: "通知を配信" });
      await waitFor(() => expect(submit).toBeEnabled());
      await user.click(submit);
      if (status === 400)
        await screen.findByText("通知内容: 通知内容を確認してください");
      else
        await within(
          screen.getByRole("region", { name: "操作通知履歴" })
        ).findByText("通知を登録できませんでした");
      expect(screen.getByLabelText("タイトル*")).toHaveValue("統合確認の通知");
      const history = screen.getByRole("region", { name: "操作通知履歴" });
      const toasts = screen.getByRole("region", { name: "Toast" });
      if (status === 400) {
        expect(
          within(history).getByText("通知はありません")
        ).toBeInTheDocument();
        expect(
          within(toasts).queryByText("通知を登録できませんでした")
        ).not.toBeInTheDocument();
      } else {
        expect(
          within(history).getByText("通知を登録できませんでした")
        ).toBeInTheDocument();
        expect(
          within(toasts).getByText("通知を登録できませんでした")
        ).toBeInTheDocument();
      }
    }
  );

  it("詳細の404をRoute内で表示し、一覧へ誤遷移しない", async () => {
    mockTransport();
    renderRoutes("/notifications/103");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "通知が見つかりません"
    );
    expect(
      screen.queryByRole("heading", { name: "通知一覧" })
    ).not.toBeInTheDocument();
  });
});
