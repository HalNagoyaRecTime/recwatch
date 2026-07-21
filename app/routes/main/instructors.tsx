import { InstructorsPage } from "~/features/instructors/pages/InstructorsPage";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

export default function InstructorsRoute() {
  return <InstructorsPage />;
}
