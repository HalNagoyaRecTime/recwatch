import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";

import type { FeedbackSeverity } from "../model/app-notification";

export const notificationSeverityIcon: Record<FeedbackSeverity, LucideIcon> = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  error: AlertCircleIcon,
};

export const notificationSeverityIconClass: Record<FeedbackSeverity, string> = {
  info: "text-brand-primary",
  success: "text-tone-success-text",
  warning: "text-tone-warning-text",
  error: "text-tone-danger-text",
};
