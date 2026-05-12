"use client";

import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/core/i18n/hooks";

import { RecentChatList } from "./recent-chat-list";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceQuickActions } from "./workspace-quick-actions";
import { WorkspaceNavMenu } from "./workspace-nav-menu";

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();

  return (
    <SidebarGroup>
      <Input
        className="bg-background border-input!"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.sidebar.searchPlaceholder}
      />
    </SidebarGroup>
  );
}

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open: isSidebarOpen, searchChat, setSearchChat } = useSidebar();

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" {...props}>
        <SidebarHeader className="py-0">
          <WorkspaceHeader />
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden gap-0">
          {isSidebarOpen && (
            <>
              <SearchInput value={searchChat} onChange={setSearchChat} />
              <WorkspaceQuickActions />
              <RecentChatList />
            </>
          )}
        </SidebarContent>
        <SidebarFooter className="border-sidebar-border border-t">
          <WorkspaceNavMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
