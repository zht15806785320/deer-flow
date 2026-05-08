"use client";

import { useEffect, type ReactNode } from "react";

import { useSysConfig } from "@/core/api/sys-config";

interface SysConfig {
  app_name?: string;
  app_name_en?: string;
  dify_api_url?: string;
  dify_target_url?: string;
  dify_logout_url?: string;
  apply_id?:string
  [key: string]: unknown;
}

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

  useEffect(() => {
    if (data) {
      window.sysConfig = data;
    }
  }, [data]);

  if (isLoading || isError) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
