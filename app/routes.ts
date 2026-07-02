import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/auth.login.tsx"),
  route("login/email", "routes/auth/auth.email.tsx"),
  route("/", "routes/app/frame.tsx", [
    index("routes/app/index.tsx"),
    route("dashboard", "routes/app/dashboard.tsx"),
    route("events/active", "routes/app/events.active.tsx"),
    route("events/past", "routes/app/events.past.tsx"),
    route("events/new", "routes/app/events.new.tsx"),
    route("members", "routes/app/members.tsx"),
    route("members/teams", "routes/app/members.teams.tsx"),
    route("members/import", "routes/app/members.import.tsx"),
    route("timing", "routes/app/timing.tsx"),
    route("sports", "routes/app/sports.tsx"),
    route("sports/tournament", "routes/app/sports.tournament.tsx"),
    route("sports/scoring", "routes/app/sports.scoring.tsx"),
    route("reports/summary", "routes/app/reports.summary.tsx"),
    route("reports/detail", "routes/app/reports.detail.tsx"),
    route("reports/export", "routes/app/reports.export.tsx"),
    route("schedule", "routes/app/schedule.tsx"),
    route("settings", "routes/app/settings.tsx"),
  ]),
] satisfies RouteConfig;
