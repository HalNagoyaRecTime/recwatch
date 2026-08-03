import { Bell } from "lucide-react";

import type { SearchOption } from "~/components/ui/form/SearchCombobox";
import notificationSearchJson from "~/features/notifications/mock/notification-search.json";

type NotificationSearchMockItem = {
  category: string;
  description: string;
  id: string;
  title: string;
};

function toSearchOption(item: NotificationSearchMockItem): SearchOption {
  return {
    badge: item.category,
    description: item.description,
    icon: Bell,
    id: item.id,
    label: item.title,
  };
}

export const notificationSearchOptions = (
  notificationSearchJson as NotificationSearchMockItem[]
).map(toSearchOption);
