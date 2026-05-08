import { fetch } from "./fetcher";
import { useQuery } from "@tanstack/react-query";

export function loadSysConfig() {
  return fetch("/api/sys-config").then((r) => r.json());
}

export function useSysConfig() {
  return useQuery({
    queryKey: ["sys-config"],
    queryFn: loadSysConfig,
    staleTime: 5 * 60 * 1000,
  });
}