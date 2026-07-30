import { GatheringSpotsPage } from "~/features/gathering-spots/pages/GatheringSpotsPage";

export function meta() {
  return [{ title: "集合場所管理 | recwatch" }];
}

export default function GatheringSpotsRoute() {
  return <GatheringSpotsPage />;
}
