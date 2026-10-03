import { apiClient } from "~/lib/api-client";

import { createHttpGatheringSpotGateway } from "./http-gathering-spot-gateway";
import { createHttpGatheringSpotReader } from "./http-gathering-spot-reader";

export const httpGatheringSpotGateway =
  createHttpGatheringSpotGateway(apiClient);

export const httpGatheringSpotReader = createHttpGatheringSpotReader(apiClient);
