import { createHttpEventNotificationGateway } from "~/features/event-notification/infrastructure/http-event-notification-gateway";
import { apiClient } from "~/lib/api-client";

import { createHttpScheduleManagementGateway } from "./http-schedule-management-gateway";

export const httpEventNotificationGateway =
  createHttpEventNotificationGateway(apiClient);

export const httpScheduleManagementGateway =
  createHttpScheduleManagementGateway(apiClient, httpEventNotificationGateway);
