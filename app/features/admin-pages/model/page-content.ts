import type { ComponentProps } from "react";

import type { AdminPlaceholderPage } from "~/features/admin-pages/components/AdminPlaceholderPage";

type AdminPageContent = ComponentProps<typeof AdminPlaceholderPage>;

export const pageContent = {
  dashboard: {
    eyebrow: "Dashboard",
    title: "Dashboard",
    description: "Standard dashboard page when mock mode is disabled.",
    sections: [
      {
        title: "Overview",
        description: "This area will hold the dashboard summary widgets.",
      },
      {
        title: "Activity",
        description: "This area will hold the latest operational activity.",
      },
    ],
  },
  members: {
    eyebrow: "Members",
    title: "Member List",
    description: "Management page for members.",
    sections: [
      {
        title: "Member Table",
        description: "This area will hold the table, search, and filters.",
      },
      {
        title: "Member Detail",
        description: "This area will show details for the selected member.",
      },
    ],
  },
  membersImport: {
    eyebrow: "Members",
    title: "Import",
    description: "Import page for members.",
    sections: [
      {
        title: "Import Queue",
        description: "This area will list uploaded files and import status.",
      },
      {
        title: "Validation Result",
        description: "This area will show validation and mapping results.",
      },
    ],
  },
  membersTeams: {
    eyebrow: "Members",
    title: "Teams",
    description: "Team management page for members.",
    sections: [
      {
        title: "Team List",
        description: "This area will hold team rosters and assignments.",
      },
      {
        title: "Team Detail",
        description: "This area will show details for the selected team.",
      },
    ],
  },
  homeroom: {
    eyebrow: "Homeroom",
    title: "Homeroom Management",
    description: "Management page for homerooms.",
    sections: [
      {
        title: "homeroom table",
        description: "This area will hold the table, search, and filters.",
      },
      {
        title: "homeroom Detail",
        description: "This area will show details for the selected homeroom.",
      },
    ],
  },
  eventsActive: {
    eyebrow: "Events",
    title: "Active Events",
    description: "Operational page for currently active events.",
    sections: [
      {
        title: "Active Event List",
        description: "This area will show live event status and ownership.",
      },
      {
        title: "Event Detail",
        description: "This area will show timing, alerts, and staff notes.",
      },
    ],
  },
  eventsPast: {
    eyebrow: "Events",
    title: "Past Events",
    description: "Archive page for completed events.",
    sections: [
      {
        title: "Event Archive",
        description: "This area will hold completed event records.",
      },
      {
        title: "Review Notes",
        description: "This area will show post-event summaries and issues.",
      },
    ],
  },
  eventsNew: {
    eyebrow: "Events",
    title: "Create Event",
    description: "Creation page for a new event.",
    sections: [
      {
        title: "Event Form",
        description: "This area will hold event setup fields.",
      },
      {
        title: "Validation",
        description: "This area will show setup checks before publishing.",
      },
    ],
  },
  timing: {
    eyebrow: "Timing",
    title: "Timing",
    description: "Operational page for timing status.",
    sections: [
      {
        title: "Timing Monitor",
        description: "This area will show active timing feeds and gaps.",
      },
      {
        title: "Incident Queue",
        description: "This area will hold timing issues that need review.",
      },
    ],
  },
  sports: {
    eyebrow: "Sports",
    title: "Sports List",
    description: "Listing page for sports setup.",
    sections: [
      {
        title: "Sports Catalog",
        description: "This area will hold the sports list and usage state.",
      },
      {
        title: "Rule Summary",
        description: "This area will summarize rules per sport.",
      },
    ],
  },
  sportsTournament: {
    eyebrow: "Sports",
    title: "Tournament Setup",
    description: "Management page for tournament brackets.",
    sections: [
      {
        title: "Bracket Structure",
        description: "This area will hold tournament bracket settings.",
      },
      {
        title: "Seeding Rules",
        description: "This area will show seeding and advancement rules.",
      },
    ],
  },
  sportsScoring: {
    eyebrow: "Sports",
    title: "Scoring Setup",
    description: "Management page for scoring rules.",
    sections: [
      {
        title: "Score Rules",
        description: "This area will hold scoring methods and limits.",
      },
      {
        title: "Result Mapping",
        description: "This area will show how results map to standings.",
      },
    ],
  },
  reportsSummary: {
    eyebrow: "Reports",
    title: "Summary Report",
    description: "Summary reporting page.",
    sections: [
      {
        title: "Summary Metrics",
        description: "This area will hold high-level report metrics.",
      },
      {
        title: "Trend View",
        description: "This area will show report trends over time.",
      },
    ],
  },
  reportsDetail: {
    eyebrow: "Reports",
    title: "Detail Report",
    description: "Detailed reporting page.",
    sections: [
      {
        title: "Detail Table",
        description: "This area will hold detailed report rows.",
      },
      {
        title: "Filters",
        description: "This area will hold report filter controls.",
      },
    ],
  },
  reportsExport: {
    eyebrow: "Reports",
    title: "Export",
    description: "Report export page.",
    sections: [
      {
        title: "Export Options",
        description: "This area will hold file format and scope settings.",
      },
      {
        title: "Export History",
        description: "This area will show recent report exports.",
      },
    ],
  },
  schedule: {
    eyebrow: "Schedule",
    title: "Schedule",
    description: "Management page for schedules.",
    sections: [
      {
        title: "Calendar View",
        description: "This area will show the schedule calendar.",
      },
      {
        title: "Constraint Panel",
        description: "This area will show conflicts and constraints.",
      },
    ],
  },
  settings: {
    eyebrow: "Settings",
    title: "Settings",
    description: "Management page for system settings.",
    sections: [
      {
        title: "Configuration",
        description: "This area will hold adapter and feature settings.",
      },
      {
        title: "Audit",
        description: "This area will show setting change history.",
      },
    ],
  },
} satisfies Record<string, AdminPageContent>;
