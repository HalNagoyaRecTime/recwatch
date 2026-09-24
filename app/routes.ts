import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/auth.login.tsx"),
  route("auth/callback", "routes/auth/auth.callback.tsx"),
  route("account-deletion", "routes/account-deletion.tsx"),
  route("account-deletion/callback", "routes/account-deletion.callback.tsx"),
  // 未実装・emailログイン
  // route("login/email", "routes/auth/auth.email.tsx"),
  route("/", "routes/main/frame.tsx", [
    index("routes/main/index.tsx"),
    route("dashboard", "routes/main/dashboard.tsx"),
    route("events", "routes/main/sports.tsx", [
      route("new", "routes/main/sports.new.tsx"),
    ]),
    route("events/today", "routes/main/events.today.tsx"),
    route(
      "events/:competitionId/edit",
      "routes/main/sports.$competitionId.edit.tsx"
    ),
    // 集合設定モーダルはイベント詳細の上に開き、閉じると詳細へ戻る
    route("events/:competitionId", "routes/main/sports.$competitionId.tsx", [
      route("gatherings", "routes/main/sports.$competitionId.gatherings.tsx"),
    ]),
    route("notifications", "routes/main/notifications.tsx"),
    route("notifications/new", "routes/main/notifications.new.tsx"),
    route(
      "notifications/:notificationId",
      "routes/main/notifications.$notificationId.tsx"
    ),
    route("students", "routes/main/students.tsx"),
    route("students/import", "routes/main/students.import.tsx"),
    route("teams", "routes/main/teams.tsx"),
    route("ranking", "routes/main/ranking.tsx"),
    route("classroom", "routes/main/classRoom.tsx", [
      route("new", "routes/main/classRoom.new.tsx"),
    ]),
    route("teachers", "routes/main/teachers.tsx", [
      route("new", "routes/main/teachers.new.tsx"),
      route(":teacherId/edit", "routes/main/teachers.$teacherId.edit.tsx"),
    ]),
    route("gathering-spots", "routes/main/gatheringSpots.tsx"),
    route("*", "routes/main/legacy-redirect.tsx"),
  ]),
] satisfies RouteConfig;
