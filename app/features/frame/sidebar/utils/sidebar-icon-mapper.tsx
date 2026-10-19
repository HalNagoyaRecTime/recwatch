import {
  CalendarIcon,
  Clock3Icon,
  FileTextIcon,
  GraduationCapIcon,
  HistoryIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SendIcon,
  SettingsIcon,
  TimerResetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SidebarIconKey } from "~/config/routes";

const iconSize = 15;

export const sidebarIconMap: Record<SidebarIconKey, ReactNode> = {
  calendar: <CalendarIcon size={iconSize} strokeWidth={1.8} />,
  clock: <Clock3Icon size={iconSize} strokeWidth={1.8} />,
  dashboard: <LayoutDashboardIcon size={iconSize} strokeWidth={1.8} />,
  file: <FileTextIcon size={iconSize} strokeWidth={1.8} />,
  home: <HomeIcon size={iconSize} strokeWidth={1.8} />,
  notification: <SendIcon size={iconSize} strokeWidth={1.8} />,
  notificationHistory: <HistoryIcon size={iconSize} strokeWidth={1.8} />,
  classRoom: <GraduationCapIcon size={iconSize} strokeWidth={1.8} />,
  settings: <SettingsIcon size={iconSize} strokeWidth={1.8} />,
  timing: <TimerResetIcon size={iconSize} strokeWidth={1.8} />,
  trophy: <TrophyIcon size={iconSize} strokeWidth={1.8} />,
  users: <UsersIcon size={iconSize} strokeWidth={1.8} />,
};
