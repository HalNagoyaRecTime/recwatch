import { createPageTitle } from "~/config/app";
import { httpGatheringSpotGateway } from "~/features/gathering-spots/api/http/gathering-spot-dependencies";
import { GatheringSpotsPage } from "~/features/gathering-spots/pages/GatheringSpotsPage";

export function meta() {
  return [{ title: createPageTitle("集合場所管理") }];
}

export default function GatheringSpotsRoute() {
  return <GatheringSpotsPage gateway={httpGatheringSpotGateway} />;
}
