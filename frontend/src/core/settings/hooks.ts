import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  DEFAULT_LOCAL_SETTINGS,
  applyThreadModelOverride,
  type LocalSettings,
} from "./local";
import {
  getBaseSettingsSnapshot,
  getThreadModelSnapshot,
  getThreadSkillsSnapshot,
  subscribe,
  updateLocalSettings,
  updateThreadSettings,
  type LocalSettingsSetter,
} from "./store";

export function useLocalSettings(): [LocalSettings, LocalSettingsSetter] {
  const settings = useSyncExternalStore(
    subscribe,
    getBaseSettingsSnapshot,
    () => DEFAULT_LOCAL_SETTINGS,
  );

  const setSettings = useCallback<LocalSettingsSetter>((key, value) => {
    updateLocalSettings(key, value);
  }, []);

  return [settings, setSettings];
}

export function useThreadSettings(
  threadId: string,
): [LocalSettings, LocalSettingsSetter] {
  const baseSettings = useSyncExternalStore(
    subscribe,
    getBaseSettingsSnapshot,
    () => DEFAULT_LOCAL_SETTINGS,
  );

  const threadModelName = useSyncExternalStore(
    subscribe,
    () => getThreadModelSnapshot(threadId),
    () => undefined,
  );

  const threadSkills = useSyncExternalStore(
    subscribe,
    () => getThreadSkillsSnapshot(threadId),
    () => undefined,
  );

  const settings = useMemo(() => {
    const base = applyThreadModelOverride(baseSettings, threadModelName);
    return {
      ...base,
      context: {
        ...base.context,
        skills: threadSkills,
      },
    };
  }, [baseSettings, threadModelName, threadSkills]);

  const setSettings = useCallback<LocalSettingsSetter>(
    (key, value) => {
      updateThreadSettings(threadId, key, value);
    },
    [threadId],
  );

  return [settings, setSettings];
}
