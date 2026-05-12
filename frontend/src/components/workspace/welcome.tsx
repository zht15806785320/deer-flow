"use client";

import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

import { AuroraText } from "../ui/aurora-text";

export function Welcome({
  className,
  mode,
}: {
  className?: string;
  mode?: "ultra" | "pro" | "thinking" | "flash";
}) {
  const { t } = useI18n();
  const colors = ["var(--color-foreground)"];

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center gap-2 px-8 py-10 text-center",
        className,
      )}
    >
      <div className="text-3xl font-bold">
        <div className="flex items-center gap-2">
          <AuroraText colors={colors}>
            {window.sysConfig?.app_name || t.welcome.greeting}
          </AuroraText>
        </div>
      </div>
    </div>
  );
}
