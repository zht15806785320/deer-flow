"use client";

import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({ className }: { className?: string }) {
  const { t } = useI18n();
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "group/workspace-header flex h-12 flex-col justify-center",
          className,
        )}
      >
        {state === "collapsed" ? (
          <SidebarMenuButton
            isActive
            asChild
            className="group-has-data-[collapsible=icon]/sidebar-wrapper:-translate-y flex w-full cursor-pointer items-center justify-center"
          >
            <SidebarTrigger
              size="sm"
              className="text-muted-foreground opacity-100"
            />
          </SidebarMenuButton>
        ) : (
          <div className="flex min-w-(--sidebar-width) items-center justify-between gap-2 pr-4">
            <Button>
              <MessageSquarePlus size={16} />
              <span>{t.sidebar.createChat}</span>
            </Button>
            <SidebarTrigger
              variant="default"
              className="size-8 border-transparent"
            />
          </div>
        )}
      </div>

      {state === "collapsed" && (
        <SidebarMenuButton
          isActive={pathname === "/workspace/chats/new"}
          asChild
          tooltip={t.sidebar.createChat}
        >
          <Link className="text-muted-foreground" href="/workspace/chats/new">
            <MessageSquarePlus size={16} />
          </Link>
        </SidebarMenuButton>
      )}
    </>
  );
}
