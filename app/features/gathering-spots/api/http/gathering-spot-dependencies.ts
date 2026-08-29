import { apiClient } from "~/lib/api-client";

import { createHttpGatheringSpotGateway } from "./http-gathering-spot-gateway";

export const httpGatheringSpotGateway =
  createHttpGatheringSpotGateway(apiClient);
