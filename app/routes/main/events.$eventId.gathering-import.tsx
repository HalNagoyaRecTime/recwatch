import { createPageTitle } from "~/lib/page-title";
import { GatheringImportPage } from "~/features/gathering-import/pages/GatheringImportPage";

export function meta() {
  return [{ title: createPageTitle("集合の取り込み") }];
}

export default function GatheringImportRoute() {
  return <GatheringImportPage />;
}
