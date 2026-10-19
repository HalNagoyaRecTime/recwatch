const destinationByPath: Readonly<Record<string, string>> = {
  "/events/active": "/events",
  "/events/past": "/events",
  "/events/scoring": "/events",
  "/events/tournament": "/events",
  "/members/teams": "/members",
  "/reports/detail": "/dashboard",
  "/reports/export": "/dashboard",
  "/reports/summary": "/dashboard",
  "/settings": "/dashboard",
  "/timing": "/schedule",
};

export function getLegacyDestination(pathname: string): string {
  if (pathname === "/sports") {
    return "/events";
  }

  if (pathname.startsWith("/sports/")) {
    const suffix = pathname.slice("/sports/".length);

    if (suffix === "new" || suffix === "assignments") {
      return `/events/${suffix}`;
    }

    if (/^\d+\/edit$/.test(suffix)) {
      return `/events/${suffix}`;
    }

    return "/events";
  }

  if (/^\/teachers\/\d+$/.test(pathname)) {
    return `${pathname}/edit`;
  }

  return destinationByPath[pathname] ?? "/dashboard";
}
