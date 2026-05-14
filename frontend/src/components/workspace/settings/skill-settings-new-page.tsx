"use client";

import { SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemTitle,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useI18n } from "@/core/i18n/hooks";
import {
  useDownloadSkill,
  useEnableSkill,
  useUninstallSkill,
  useSkills,
} from "@/core/skills/hooks";
import type { Skill, LoadSkillsParams, EnableSkill } from "@/core/skills/type";

import { SettingsSection } from "./settings-section";

export function SkillSettingsPage({ onClose }: { onClose?: () => void } = {}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<LoadSkillsParams["tab"]>("-1");
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 300);

  const queryParams = useMemo(
    () => ({ tab, keyWords: debouncedSearch }),
    [tab, debouncedSearch],
  );

  const { skills = [], isLoading, error } = useSkills(queryParams);

  return (
    <SettingsSection
      title={t.settings.skills.title}
      description={t.settings.skills.description}
    >
      <div className="flex w-full flex-col gap-4">
        <header className="flex justify-between">
          <Input
            className="border-input! w-1/2"
            placeholder={t.settings.skills.searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <ToggleGroup
            type="single"
            variant="primary"
            size="sm"
            value={tab}
            onValueChange={(value) => {
              if (value) {
                setTab(value as LoadSkillsParams["tab"]);
              }
            }}
          >
            <ToggleGroupItem value="-1">{t.common.all}</ToggleGroupItem>
            <ToggleGroupItem value="0">
              {t.settings.skills.Uninstalled}
            </ToggleGroupItem>
          </ToggleGroup>
        </header>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">
            {t.common.loading}
          </div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <SkillSettingsList skills={skills} onClose={onClose} />
        )}
      </div>
    </SettingsSection>
  );
}

function SkillSettingsList({
  skills,
  onClose,
}: {
  skills: Skill[];
  onClose?: () => void;
}) {
  const { t } = useI18n();
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [dialogSkill, setDialogSkill] = useState<Skill>();
  const { mutate: enableSkill } = useEnableSkill();
  const { mutate: downloadSkill } = useDownloadSkill();
  const { mutate: uninstallSkill } = useUninstallSkill();



  const handleOpenDialog = (skill: Skill) => {
    setDialogSkill(skill);
    setSkillDialogOpen(true);
  };

  return (
    <>
      {skills.length === 0 && <EmptySkill />}
      {skills.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              className="border-border rounded-md border p-2 text-sm transition-colors"
              key={skill.name}
              onClick={() => handleOpenDialog(skill)}
            >
              <ItemContent>
                <ItemHeader className="basis-auto">
                  <ItemTitle
                    className="block w-0 flex-auto truncate"
                    title={skill.name}
                  >
                    {skill.name}
                  </ItemTitle>
                  <ItemActions className="shrink-0">
                    <Switch
                      className="data-[state=checked]:bg-foreground"
                      checked={skill.enabled}
                      onPointerDown={(e) => e.stopPropagation()}
                      onCheckedChange={(checked) =>
                        enableSkill({ skillName: skill.name, enabled: checked })
                      }
                    />
                  </ItemActions>
                </ItemHeader>
                <ItemDescription className="text-muted-foreground line-clamp-1">
                  {skill.description}
                </ItemDescription>
                <ItemFooter className="basis-auto gap-2">
                  {skill.has_update ? (
                    <span className="self-start rounded-xs bg-amber-100 px-2 py-1 text-sm text-yellow-600">
                      {t.settings.skills.HasUpdate}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={
                      skill.is_downloaded ? "text-success" : "text-primary"
                    }
                  >
                    {skill.is_downloaded
                      ? t.settings.skills.Installed
                      : t.settings.skills.Uninstalled}
                  </span>
                </ItemFooter>
              </ItemContent>
            </div>
          ))}
        </div>
      )}
      <SkillDetilasDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
        skillData={dialogSkill}
        enableSkill={enableSkill}
        onDownload={downloadSkill}
        onUninstall={uninstallSkill}
      />
    </>
  );
}

type SkillDialogProps = React.ComponentProps<typeof Dialog> & {
  skillData?: Skill;
  enableSkill: (body: EnableSkill) => void;
  onDownload: (skillId: string) => void;
  onUninstall: (skillId: string) => void;
};

function SkillDetilasDialog(props: SkillDialogProps) {
  const { skillData, enableSkill, onDownload, onUninstall, ...dialogProps } =
    props;
  const { t } = useI18n();

  return (
    <Dialog {...dialogProps}>
      <DialogContent
        className="flex max-h-[50vh] w-[40vw] flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader className="gap-1">
          <DialogTitle>{skillData?.name}</DialogTitle>
          <span
            className={
              skillData?.has_update
                ? "self-start rounded-xs bg-amber-100 px-2 py-1 text-sm text-yellow-600"
                : "bg-accent self-start rounded-xs px-2 py-1 text-sm"
            }
          >
            {skillData?.has_update
              ? t.settings.skills.HasUpdate
              : t.settings.skills.LatestVersion}
          </span>
        </DialogHeader>
        <DialogDescription>{skillData?.description}</DialogDescription>
        <div className="flex flex-col gap-2">
          {skillData?.id && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.common.installStatus}
              </span>
              <span
                className={
                  skillData?.is_downloaded ? "text-success" : "text-primary"
                }
              >
                {skillData?.is_downloaded
                  ? t.settings.skills.Installed
                  : t.settings.skills.Uninstalled}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t.common.enabledStatus}
            </span>
            <Switch
              className="data-[state=checked]:bg-foreground"
              checked={skillData?.enabled}
              onCheckedChange={(checked) =>
                enableSkill({ skillName: skillData!.name, enabled: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t.common.type}</span>
            <span className="text-foreground text-sm">{skillData?.type}</span>
          </div>
        </div>
        {skillData?.id && (
          <div className="flex gap-2">
            {(skillData?.has_update || !skillData?.is_downloaded) && (
              <Button
                variant="primary"
                onClick={() => onDownload(skillData!.id!)}
              >
                {skillData?.has_update
                  ? t.settings.skills.Update
                  : t.settings.skills.Install}
              </Button>
            )}
            {skillData?.is_downloaded && !skillData?.has_update && (
              <Button
                variant="outline"
                onClick={() => onUninstall(skillData!.id!)}
              >
                {t.settings.skills.Uninstall}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmptySkill() {
  const { t } = useI18n();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SparklesIcon />
        </EmptyMedia>
        <EmptyTitle>{t.settings.skills.emptyTitle}</EmptyTitle>
        <EmptyDescription>
          {t.settings.skills.emptyDescription}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
