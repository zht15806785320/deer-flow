import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { enableSkill, type LoadSkillsParams } from "./api";

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
    mutationFn: async ({
      skillName,
      enabled,
    }: {
      skillName: string;
      enabled: boolean;
    }) => {
      await enableSkill(skillName, enabled);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}
