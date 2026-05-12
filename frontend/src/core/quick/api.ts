import { fetch } from "@/core/api/fetcher";

export interface QuickAction {
  name: string;
  url: string;
  icon: string;
}

export interface ResponseQuickAction {
  data: QuickAction[];
}

export const fetchQuickActions = (): Promise<ResponseQuickAction> => {
  return fetch(
    window.sysConfig?.dify_api_url + "/home/app/fast-search-config",
  ).then((r) => r.json());
};
