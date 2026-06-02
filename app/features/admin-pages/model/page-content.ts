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
  eventsActive: {
    eyebrow: "Events",
    title: "Active Events",
    description: "Operational page for monitoring active events.",
    sections: [
      {
        title: "Event List",
        description: "This area will hold the active event list and status.",
      },
      {
        title: "Operational Status",
        description: "This area will surface alerts, delays, and assignments.",
      },
    ],
  },
  eventsPast: {
    eyebrow: "Events",
    title: "Past Events",
    description: "Archive page for completed events.",
    sections: [
      {
        title: "Archive List",
        description: "This area will hold archived events and filters.",
      },
      {
        title: "Export History",
        description: "This area will show reports and export history.",
      },
    ],
  },
  eventsNew: {
    eyebrow: "Events",
    title: "Create Event",
    description: "Creation page for a new event.",
    sections: [
      {
        title: "Basic Information",
        description: "This area will hold event name, date, and venue inputs.",
      },
      {
        title: "Setup Blocks",
        description: "This area will hold category and setup configuration.",
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
  membersTeams: {
    eyebrow: "Members",
    title: "Teams",
    description: "Management page for team assignments.",
    sections: [
      {
        title: "Team List",
        description: "This area will hold the team list and status.",
      },
      {
        title: "Assignment Detail",
        description: "This area will show assignment and team detail.",
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
  timing: {
    eyebrow: "Timing",
    title: "Timing Control",
    description: "Control page for timing operations.",
    sections: [
      {
        title: "Device Status",
        description: "This area will show connected device status.",
      },
      {
        title: "Incident Log",
        description: "This area will show incidents and manual actions.",
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
    title: "Tournament",
    description: "Setup page for tournament rules.",
    sections: [
      {
        title: "Bracket Rules",
        description: "This area will define seeding and bracket rules.",
      },
      {
        title: "Validation",
        description: "This area will show validation and missing settings.",
      },
    ],
  },
  sportsScoring: {
    eyebrow: "Sports",
    title: "Scoring Rules",
    description: "Management page for scoring rules.",
    sections: [
      {
        title: "Scoring Profiles",
        description: "This area will list scoring profiles and formulas.",
      },
      {
        title: "Audit Trail",
        description: "This area will show change history and activation state.",
      },
    ],
  },
  reportsSummary: {
    eyebrow: "Reports",
    title: "Summary",
    description: "Summary page for reports.",
    sections: [
      {
        title: "Summary Filters",
        description: "This area will hold filters for report scope.",
      },
      {
        title: "Summary Result",
        description: "This area will show summary metrics and deltas.",
      },
    ],
  },
  reportsDetail: {
    eyebrow: "Reports",
    title: "Detail",
    description: "Detailed report page.",
    sections: [
      {
        title: "Detail Filters",
        description: "This area will hold filters and drilldown controls.",
      },
      {
        title: "Detail Result",
        description: "This area will show detailed rows and drilldown results.",
      },
    ],
  },
  reportsExport: {
    eyebrow: "Reports",
    title: "Export",
    description: "Export page for report outputs.",
    sections: [
      {
        title: "Export Jobs",
        description: "This area will list export jobs and statuses.",
      },
      {
        title: "Output Settings",
        description: "This area will hold format and destination settings.",
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
