import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { enableSkill, downloadSkill, uninstallSkill } from "./api";
import type { LoadSkillsParams, EnableSkill } from "./type";
import { loadSkills } from ".";

export function useSkills(params?: LoadSkillsParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["skills", params],
    queryFn: () => loadSkills(params),
  });
  return { skills: data ?? [], isLoading, error };
}

export function useEnableSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ skillName, enabled }: EnableSkill) => {
      await enableSkill(skillName, enabled);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useDownloadSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => downloadSkill(skillId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useUninstallSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => uninstallSkill(skillId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}
