"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { useEffect, useState } from "react";

import { useFinePointer } from "@/hooks/use-fine-pointer";
import {
  motionTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { VoteValue } from "@/lib/types";
import { FIBONACCI_VALUES } from "@/lib/types";
import { voteShortcutLabel } from "@/lib/keyboard-shortcuts";

interface VoteCardsProps {
  selected: VoteValue | null;
  onSelect: (value: VoteValue) => void;
  disabled?: boolean;
}

function VoteCardLabel({ value }: { value: VoteValue }) {
  if (value === "☕") {
    return <Coffee className="h-4 w-4" aria-hidden />;
  }
  return <span>{value}</span>;
}

export function VoteCards({ selected, onSelect, disabled }: VoteCardsProps) {
  const [optimistic, setOptimistic] = useState<VoteValue | null>(null);
  const showShortcuts = useFinePointer();

  useEffect(() => {
    if (selected !== null) {
      setOptimistic(null);
    }
  }, [selected]);

  const active = optimistic ?? selected;

  const handleSelect = (value: VoteValue) => {
    if (disabled) return;
    setOptimistic(value);
    onSelect(value);
  };

  return (
    <motion.div
      role="group"
      aria-label="Vote cards"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1",
        "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-9",
      )}
    >
      {FIBONACCI_VALUES.map((value) => {
        const isSelected = active === value;
        const keyHint = voteShortcutLabel(value);

        return (
          <motion.button
            key={value}
            variants={staggerItemVariants}
            type="button"
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.96 }}
            whileHover={disabled ? undefined : { scale: 1.02 }}
            transition={motionTransition.spring}
            onClick={() => handleSelect(value)}
            className={cn(
              "relative flex h-12 min-w-[44px] shrink-0 snap-center items-center justify-center rounded-xl border-2 px-2 text-base font-bold",
              "transition-[color,background-color,border-color,box-shadow] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              "sm:h-14 sm:min-w-0 sm:w-full sm:text-lg",
              isSelected
                ? "border-primary bg-primary/20 text-primary shadow-sm shadow-primary/10"
                : "border-border bg-surface/80 text-foreground hover:border-primary/50 hover:bg-surface",
              disabled && "cursor-not-allowed opacity-60",
            )}
            aria-pressed={isSelected}
            aria-label={
              showShortcuts && keyHint
                ? `Vote ${value}, shortcut ${keyHint}`
                : `Vote ${value}`
            }
            title={showShortcuts && keyHint ? `Press ${keyHint}` : undefined}
          >
            <VoteCardLabel value={value} />
            {showShortcuts && keyHint && !disabled ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0.5 right-1 text-[9px] font-normal leading-none text-muted-foreground/50"
              >
                {keyHint}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
