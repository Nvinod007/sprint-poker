"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { formatShortcut } from "@/lib/keyboard-shortcuts";

import type { ReactNode } from "react";

interface ActionTooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function ActionTooltip({
  label,
  shortcut,
  children,
  side = "bottom",
}: ActionTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        collisionPadding={8}
        className="flex items-center gap-2 whitespace-nowrap text-xs"
      >
        <span className="font-medium text-foreground">{label}</span>
        {shortcut ? <Kbd>{formatShortcut(shortcut)}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
}
