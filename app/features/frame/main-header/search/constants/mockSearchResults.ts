export type SearchResultItem = {
  id: string;
  title: string;
  category: string;
};

export const MOCK_SEARCH_RESULTS: SearchResultItem[] = [
  { id: "1", title: "How to reset workspace layout", category: "Help Center" },
  { id: "2", title: "Weekly product sync notes", category: "Documents" },
  { id: "3", title: "Release checklist v2", category: "Playbooks" },
  { id: "4", title: "Design review: Search UX", category: "Projects" },
  { id: "5", title: "API token rotation guide", category: "Security" },
  { id: "6", title: "Q2 roadmap planning board", category: "Boards" },
  { id: "7", title: "Incident #482 timeline", category: "Incidents" },
  { id: "8", title: "Onboarding: first week tasks", category: "Guides" },
  { id: "9", title: "Frontend naming decisions", category: "ADR" },
  { id: "10", title: "Sprint 18 retro action items", category: "Meetings" },
  { id: "11", title: "Data pipeline ownership", category: "Teams" },
  { id: "12", title: "Customer interview summary", category: "Research" },
  { id: "13", title: "Feature flag rollout plan", category: "Operations" },
  { id: "14", title: "Billing webhook spec", category: "Specs" },
  { id: "15", title: "Accessibility checklist", category: "Quality" },
];
