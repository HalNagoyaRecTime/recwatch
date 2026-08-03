export type NotificationDeliveryStatus = "delivered" | "failed" | "pending";

export type NotificationListItem = {
  audience: string;
  competition: string;
  deliveredAt: string;
  id: string;
  schedule: string;
  sender: string;
  status: NotificationDeliveryStatus;
  title: string;
};
