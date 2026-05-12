"use client";

import { cn } from "@/lib/utils";

export interface IconFontProps extends React.SVGAttributes<SVGSVGElement> {
  name: string;
  size?: number | string;
}

export function IconFont({
  name,
  size,
  className,
  ...props
}: IconFontProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("inline-block shrink-0 align-middle", className)}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
