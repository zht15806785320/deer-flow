"use client";

import { type ReactNode } from "react";
import { Loader } from "@/components/ai-elements/loader";
import { Button } from "@/components/ui/button";
import { type SysConfig, useSysConfig } from "@/core/api/sys-config";

declare global {
  interface Window {
    sysConfig: SysConfig | undefined;
  }
}

interface SysConfigProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SysConfigProvider({
  children,
  fallback,
}: SysConfigProviderProps) {
  const { data, isLoading, isError } = useSysConfig();

  if (isLoading) {
    return fallback ?? <LoadingFallback />;
  }

  if (isError) {
    return fallback ?? <ErrorFallback />;
  }

  if (data) {
    window.sysConfig = data;
  }

  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader size={32} />
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <p className="text-muted-foreground text-sm">
        Failed to load system config.
      </p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}
