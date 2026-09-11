import { SidebarShell } from "~/features/frame/sidebar/SidebarShell";
import { MainShell } from "~/features/frame/main-header/MainShell";
import { SidebarStateProvider } from "~/components/providers/SidebarStateProvider";
import type { AccountUser } from "~/features/frame/main-header/account-menu/model/account-btn-data";
import { FeedbackProvider } from "~/features/frame/feedback/components/FeedbackProvider";
import { FeedbackToastHost } from "~/features/frame/feedback/components/FeedbackToastHost";

type AppShellProps = {
  user?: AccountUser | null;
};

export function AppShell({ user }: AppShellProps) {
  return (
    <FeedbackProvider key={user?.id ?? "anonymous"} userId={user?.id ?? null}>
      <FeedbackToastHost />
      <SidebarStateProvider>
        <div className="flex h-dvh overflow-hidden md:flex-row">
          <SidebarShell />
          <MainShell user={user} />
        </div>
      </SidebarStateProvider>
    </FeedbackProvider>
  );
}
