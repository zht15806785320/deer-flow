"use client";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Download,
  FileJson,
  FileText,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, memo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { getAPIClient } from "@/core/api";
import { useI18n } from "@/core/i18n/hooks";
import {
  exportThreadAsJSON,
  exportThreadAsMarkdown,
} from "@/core/threads/export";
import {
  useDeleteThread,
  usePinThread,
  useRenameThread,
  useThreads,
  useUnpinThread,
  useThreadsClassify,
} from "@/core/threads/hooks";
import type {
  AgentThreadState,
  ChatListItemProps,
} from "@/core/threads/types";
import { pathOfThread, titleOfThread } from "@/core/threads/utils";
import { env } from "@/env";
import { isIMEComposing } from "@/lib/ime";

const ChatListItem = memo(
  ({
    thread,
    isPinned,
    pathname,
    onDelete,
    onRename,
    onPin,
    onUnpin,
  }: ChatListItemProps) => {
    const { t } = useI18n();
    const isActive = pathOfThread(thread) === pathname;

    const handleShare = useCallback(async () => {
      const VERCEL_URL = "https://deer-flow-v2.vercel.app";
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const baseUrl = isLocalhost ? VERCEL_URL : window.location.origin;
      const shareUrl = `${baseUrl}${pathOfThread(thread)}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t.clipboard.linkCopied);
      } catch {
        toast.error(t.clipboard.failedToCopyToClipboard);
      }
    }, [t, thread]);

    const handleExport = useCallback(
      async (format: "markdown" | "json") => {
        try {
          const apiClient = getAPIClient();
          const state = await apiClient.threads.getState<AgentThreadState>(
            thread.thread_id,
          );
          const messages = state.values?.messages ?? [];
          if (messages.length === 0) {
            toast.error(t.conversation.noMessages);
            return;
          }
          if (format === "markdown") {
            exportThreadAsMarkdown(thread, messages);
          } else {
            exportThreadAsJSON(thread, messages);
          }
          toast.success(t.common.exportSuccess);
        } catch {
          toast.error("Failed to export conversation");
        }
      },
      [t, thread],
    );

    return (
      <SidebarMenuItem className="group/side-menu-item">
        <SidebarMenuButton isActive={isActive} asChild>
          <div>
            <Link
              className="text-foreground block w-full whitespace-nowrap group-hover/side-menu-item:overflow-hidden"
              href={pathOfThread(thread)}
            >
              {titleOfThread(thread)}
            </Link>
            {env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY !== "true" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="bg-background/50 hover:bg-background"
                  >
                    <MoreHorizontal />
                    <span className="sr-only">{t.common.more}</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={"right"}
                  align={"start"}
                >
                  {isPinned ? (
                    <DropdownMenuItem
                      onSelect={() => onUnpin(thread.thread_id)}
                    >
                      <ArrowDownToLine className="text-muted-foreground" />
                      <span>{t.common.unPin}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => onPin(thread.thread_id)}>
                      <ArrowUpToLine className="text-muted-foreground" />
                      <span>{t.common.pin}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() =>
                      onRename(thread.thread_id, titleOfThread(thread))
                    }
                  >
                    <Pencil className="text-muted-foreground" />
                    <span>{t.common.rename}</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onSelect={handleShare}>
                  <Share2 className="text-muted-foreground" />
                  <span>{t.common.share}</span>
                </DropdownMenuItem> */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Download className="text-muted-foreground" />
                      <span>{t.common.export}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={() => handleExport("markdown")}
                      >
                        <FileText className="text-muted-foreground" />
                        <span>{t.common.exportAsMarkdown}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleExport("json")}>
                        <FileJson className="text-muted-foreground" />
                        <span>{t.common.exportAsJSON}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => onDelete(thread.thread_id)}>
                    <Trash2 className="text-muted-foreground" />
                    <span>{t.common.delete}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  },
);

export function RecentChatList() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { searchChat } = useSidebar();
  const { thread_id: threadIdFromPath, agent_name: agentNameFromPath } =
    useParams<{
      thread_id: string;
      agent_name?: string;
    }>();

  const { data: unpinnedThreads = [] } = useThreads({
    limit: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
    select: ["thread_id", "updated_at", "values", "metadata"],
    metadata: { pinned: false },
  });

  const { data: pinnedThreads = [] } = useThreads({
    limit: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
    select: ["thread_id", "updated_at", "values", "metadata"],
    metadata: { pinned: true },
  });

  // 根据搜索词过滤线程
  const filteredPinnedThreads = useMemo(() => {
    if (!searchChat.trim()) return pinnedThreads;
    return pinnedThreads.filter((thread) =>
      titleOfThread(thread).toLowerCase().includes(searchChat.toLowerCase()),
    );
  }, [pinnedThreads, searchChat]);

  // 对未置顶列表按日期分组（同时支持搜索）
  const classifiedUnpinnedThreads = useMemo(() => {
    const filtered = searchChat.trim()
      ? unpinnedThreads.filter((t) =>
          titleOfThread(t).toLowerCase().includes(searchChat.toLowerCase()),
        )
      : unpinnedThreads;
    return useThreadsClassify(filtered);
  }, [unpinnedThreads, searchChat]);

  const { mutate: deleteThread } = useDeleteThread();
  const { mutate: renameThread } = useRenameThread();
  const { mutate: pinThread } = usePinThread();
  const { mutate: unpinThread } = useUnpinThread();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameThreadId, setRenameThreadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDelete = useCallback(
    (threadId: string) => {
      deleteThread({ threadId });
      if (threadId === threadIdFromPath) {
        const threadIndex = unpinnedThreads.findIndex(
          (t) => t.thread_id === threadId,
        );
        let nextThreadPath = pathOfThread("new", {
          agent_name: agentNameFromPath,
        });
        if (threadIndex > -1) {
          if (unpinnedThreads[threadIndex + 1]) {
            nextThreadPath = pathOfThread(unpinnedThreads[threadIndex + 1]!);
          } else if (unpinnedThreads[threadIndex - 1]) {
            nextThreadPath = pathOfThread(unpinnedThreads[threadIndex - 1]!);
          }
        }
        void router.push(nextThreadPath);
      }
    },
    [
      agentNameFromPath,
      deleteThread,
      router,
      threadIdFromPath,
      unpinnedThreads,
    ],
  );

  const handleRenameClick = useCallback(
    (threadId: string, currentTitle: string) => {
      setRenameThreadId(threadId);
      setRenameValue(currentTitle);
      setRenameDialogOpen(true);
    },
    [],
  );

  const handleRenameSubmit = useCallback(() => {
    if (renameThreadId && renameValue.trim()) {
      renameThread({ threadId: renameThreadId, title: renameValue.trim() });
      setRenameDialogOpen(false);
      setRenameThreadId(null);
      setRenameValue("");
    }
  }, [renameThread, renameThreadId, renameValue]);

  const handlePin = useCallback(
    (threadId: string) => {
      pinThread({ threadId });
    },
    [pinThread],
  );

  const handleUnpin = useCallback(
    (threadId: string) => {
      unpinThread({ threadId });
    },
    [unpinThread],
  );

  // 计算未置顶列表总数
  const unpinnedCount = classifiedUnpinnedThreads.reduce(
    (acc, group) => acc + group.threads.length,
    0,
  );

  if (filteredPinnedThreads.length === 0 && unpinnedCount === 0) {
    return null;
  }

  return (
    <>
      <SidebarGroup>
        {filteredPinnedThreads.length > 0 && (
          <>
            <SidebarGroupLabel className="gap-1">
              <ArrowUpToLine />
              {t.sidebar.pinned}
            </SidebarGroupLabel>
            <SidebarGroupContent className="group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
              <SidebarMenu>
                <div className="flex w-full flex-col gap-1">
                  {filteredPinnedThreads.map((thread) => (
                    <ChatListItem
                      key={thread.thread_id}
                      thread={thread}
                      isPinned={true}
                      pathname={pathname}
                      onDelete={handleDelete}
                      onRename={handleRenameClick}
                      onPin={handlePin}
                      onUnpin={handleUnpin}
                    />
                  ))}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </>
        )}
        <SidebarGroupContent className="mt-2 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
          <SidebarMenu>
            {classifiedUnpinnedThreads.map((group) => (
              <div key={group.key}>
                <div className="bg-background/95 text-muted-foreground sticky top-0 z-10 border-b px-2 py-1.5 text-xs font-medium backdrop-blur-sm">
                  {t.sidebar[group.key as keyof typeof t.sidebar]}
                </div>
                <div className="flex w-full flex-col gap-1 p-1">
                  {group.threads.map((thread) => (
                    <ChatListItem
                      key={thread.thread_id}
                      thread={thread}
                      isPinned={false}
                      pathname={pathname}
                      onDelete={handleDelete}
                      onRename={handleRenameClick}
                      onPin={handlePin}
                      onUnpin={handleUnpin}
                    />
                  ))}
                </div>
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.common.rename}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={t.common.rename}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isIMEComposing(e)) {
                  e.preventDefault();
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={handleRenameSubmit}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
