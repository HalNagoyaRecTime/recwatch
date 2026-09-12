import { apiClient } from "~/lib/api-client";

import { createHttpEventGatheringSettingsGateway } from "./http-event-gathering-settings-gateway";
import { createHttpGatheringMemberGateway } from "./http-gathering-member-gateway";

export const httpEventGatheringSettingsGateway =
  createHttpEventGatheringSettingsGateway(apiClient);

export const httpGatheringMemberGateway =
  createHttpGatheringMemberGateway(apiClient);
