import { fetch } from "./fetcher";
import { useQuery } from "@tanstack/react-query";

export interface SysConfig {
  app_name: string;
  app_name_en: string;
  dify_api_url: string;
  apply_id: string;
  dify_target_url: string;
  dify_logout_url: string;
}

export function loadSysConfig(): Promise<SysConfig> {
  return fetch("/api/sys-config").then((r) => r.json());
}

export function useSysConfig() {
  return useQuery<SysConfig>({
    queryKey: ["sys-config"],
    queryFn: loadSysConfig,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
