import { httpGatheringSpotGateway } from "~/features/gathering-spots/api/http/gathering-spot-dependencies";
import { GatheringSpotsPage } from "~/features/gathering-spots/pages/GatheringSpotsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "集合場所管理 | recwatch" }];
}

export default function GatheringSpotsRoute() {
  return (
    <PageLayout>
      <PagePadding>
        <GatheringSpotsPage gateway={httpGatheringSpotGateway} />
      </PagePadding>
    </PageLayout>
  );
}
