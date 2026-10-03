import { apiClient } from "~/lib/api-client";

import { createHttpEventCommandGateway } from "./http-event-command-gateway";
import { createHttpEventGatheringSettingsGateway } from "./http-event-gathering-settings-gateway";
import { createHttpEventQueryGateway } from "./http-event-query-gateway";
import { createHttpGatheringMemberGateway } from "./http-gathering-member-gateway";

export const httpEventCommandGateway = createHttpEventCommandGateway(apiClient);
export const httpEventQueryGateway = createHttpEventQueryGateway(apiClient);
export const httpEventGatheringSettingsGateway =
  createHttpEventGatheringSettingsGateway(apiClient);
export const httpGatheringMemberGateway =
  createHttpGatheringMemberGateway(apiClient);
