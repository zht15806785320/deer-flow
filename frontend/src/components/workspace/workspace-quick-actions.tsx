"use client";

import { Flame } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconFont } from "@/components/ui/icon-font";
import { useI18n } from "@/core/i18n/hooks";
import { useQuickActions } from "@/core/quick/hooks";

export function WorkspaceQuickActions() {
  const { t } = useI18n();
  const { data: res, error } = useQuickActions();

  if (!res?.data || !res.data.length || error) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="gap-1">
        <IconFont name="huo" className="size-4" />
        {t.sidebar.quickActions}
      </SidebarGroupLabel>
      <SidebarMenu>
        {res.data.map((action, index) => (
          <SidebarMenuItem key={`${action.name}-${index}`}>
            <SidebarMenuButton asChild>
              <a
                className="text-foreground"
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconFont name={action.icon} className="size-4" />
                <span>{action.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
