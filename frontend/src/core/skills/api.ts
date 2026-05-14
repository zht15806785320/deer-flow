import { buildQueryString } from "@/lib/utils";
import { fetch } from "@/core/api/fetcher";
import { getBackendBaseURL } from "@/core/config";

import type { Skill, LoadSkillsParams } from "./type";

export async function loadSkills(params?: LoadSkillsParams) {
  const query = buildQueryString(params);
  const skills = await fetch(
    `${getBackendBaseURL()}/api/skills${query ? `?${query}` : ""}`,
  );
  const json = await skills.json();
  return json.skills as Skill[];
}

export async function enableSkill(skillName: string, enabled: boolean) {
  const response = await fetch(
    `${getBackendBaseURL()}/api/skills/${skillName}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled,
      }),
    },
  );
  return response.json();
}

export interface InstallSkillRequest {
  thread_id: string;
  path: string;
}

export interface InstallSkillResponse {
  success: boolean;
  skill_name: string;
  message: string;
}

export async function installSkill(
  request: InstallSkillRequest,
): Promise<InstallSkillResponse> {
  const response = await fetch(`${getBackendBaseURL()}/api/skills/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // Handle HTTP error responses (4xx, 5xx)
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ?? `HTTP ${response.status}: ${response.statusText}`;
    return {
      success: false,
      skill_name: "",
      message: errorMessage,
    };
  }

  return response.json();
}

// 安装/更新
export async function downloadSkill(skillId: string) {
  const response = await fetch(
    `${getBackendBaseURL()}/api/skills/download/${skillId}`,
  );
  return response.json();
}

// 卸载
export async function uninstallSkill(skillId: string) {
  const response = await fetch(
    `${getBackendBaseURL()}/api/skills/${skillId}`,
    {
      method: "DELETE",
    },
  );
  return response.json();
}
