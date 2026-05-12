import { useQuery } from "@tanstack/react-query";
import { type ResponseQuickAction, fetchQuickActions } from "./api";

/**
 * Prevents the query from firing until `window.sysConfig` is available.
 * This avoids a spurious 404 when the component is mounted before the
 * `useEffect` in `SysConfigProvider` has had a chance to populate
 * `window.sysConfig.dify_api_url`.
 */
export const useQuickActions = () => {
  const apiUrl = window.sysConfig?.dify_api_url;

  return useQuery<ResponseQuickAction>({
    queryKey: ["quick-actions"],
    queryFn: fetchQuickActions,
    enabled: Boolean(apiUrl),
    staleTime: 5 * 60 * 1000,
  });
};
