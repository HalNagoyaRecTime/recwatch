import type { ComponentProps } from "react";

import dashboardMock from "~/mock/dashboard.json";

import type { AdminScreenPage } from "~/features/admin-pages/components/AdminScreenPage";

export type DashboardContent = ComponentProps<typeof AdminScreenPage>;

type DashboardActivityTone = DashboardContent["activities"][number]["tone"];

function normalizeTone(tone: string): DashboardActivityTone {
  if (
    tone === "green" ||
    tone === "blue" ||
    tone === "orange" ||
    tone === "red"
  ) {
    return tone;
  }

  return "blue";
}

export const dashboardContent: DashboardContent = {
  ...dashboardMock,
  activities: dashboardMock.activities.map((activity) => ({
    ...activity,
    tone: normalizeTone(activity.tone),
  })),
  checklist: dashboardMock.checklist.map((item) => ({
    ...item,
    tone: normalizeTone(item.tone),
  })),
};
