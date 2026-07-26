import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/auth.login.tsx"),
  // 未実装・emailログイン
  // route("login/email", "routes/auth/auth.email.tsx"),
  route("/", "routes/main/frame.tsx", [
    index("routes/main/index.tsx"),
    route("dashboard", "routes/main/dashboard.tsx"),
    route("events/active", "routes/main/events.active.tsx"),
    route("events/past", "routes/main/events.past.tsx"),
    route("events/new", "routes/main/events.new.tsx"),
    route("notifications", "routes/main/notifications.tsx"),
    route("notifications/new", "routes/main/notifications.new.tsx"),
    route("members", "routes/main/members.tsx"),
    route("members/teams", "routes/main/members.teams.tsx"),
    route("members/import", "routes/main/members.import.tsx"),
    route("classroom", "routes/main/classRoom.tsx"),
    route("instructors", "routes/main/instructors.tsx"),
    route("timing", "routes/main/timing.tsx"),
    route("sports", "routes/main/sports.tsx"),
    route("sports/tournament", "routes/main/sports.tournament.tsx"),
    route("sports/scoring", "routes/main/sports.scoring.tsx"),
    route("sports/new", "routes/main/sports.new.tsx"),
    route("sports/assignments", "routes/main/sports.assignments.tsx"),
    route(
      "sports/:competitionId/edit",
      "routes/main/sports.$competitionId.edit.tsx"
    ),
    route("reports/summary", "routes/main/reports.summary.tsx"),
    route("reports/detail", "routes/main/reports.detail.tsx"),
    route("reports/export", "routes/main/reports.export.tsx"),
    route("schedule", "routes/main/schedule.tsx"),
    route("schedule/new", "routes/main/schedule.new.tsx"),
    route("participants", "routes/main/participants.tsx"),
    route("gathering-spots", "routes/main/gatheringSpots.tsx"),
    route("settings", "routes/main/settings.tsx"),
  ]),
] satisfies RouteConfig;
