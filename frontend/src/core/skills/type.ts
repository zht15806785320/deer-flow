export interface Skill {
  id?: string;
  name: string;
  description: string;
  category: string;
  license: string;
  enabled: boolean;
  version: string;
  type: string;
  is_downloaded:boolean;
  has_update: boolean;
}

export interface LoadSkillsParams {
  enable_only?: boolean;
  tab?: "-1" | "0" | "1"; // -1=>全部，0=>未安装，1=>已安装
  keyWords?: string;
  [key: string]: unknown;
}

export interface EnableSkill {
  skillName: string;
  enabled: boolean;
}
