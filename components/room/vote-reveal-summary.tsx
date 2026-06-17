"use client";

import { motion } from "framer-motion";
import { Coffee, PartyPopper, Sparkles } from "lucide-react";
import { useMemo } from "react";

import type { Vote, VoteValue } from "@/lib/types";
import {
  aggregateVotes,
  computeAverage,
  formatAverage,
  hasNumericConsensus,
} from "@/lib/vote-stats";
import {
  fadeUpVariants,
  motionTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

interface VoteRevealSummaryProps {
  votes: Vote[];
  revealed: boolean;
  compact?: boolean;
  embedded?: boolean;
}

function VoteValueLabel({ value }: { value: VoteValue }) {
  if (value === "☕") {
    return <Coffee className="h-5 w-5" aria-hidden />;
  }
  return <span>{value}</span>;
}

function voteValueSpLabel(value: VoteValue): string {
  if (value === "?") return "?";
  if (value === "☕") return "break";
  return `${value} sp`;
}

function voteCountLabel(count: number, value: VoteValue): string {
  const label = voteValueSpLabel(value);
  return count === 1 ? `1 vote for ${label}` : `${count} votes for ${label}`;
}

export function VoteRevealSummary({
  votes,
  revealed,
  compact = false,
  embedded = false,
}: VoteRevealSummaryProps) {
  const distribution = useMemo(() => aggregateVotes(votes), [votes]);
  const average = useMemo(() => computeAverage(votes), [votes]);
  const consensus = useMemo(() => hasNumericConsensus(votes), [votes]);
  const maxCount = useMemo(
    () => Math.max(...distribution.map((d) => d.count), 1),
    [distribution],
  );

  if (!revealed || distribution.length === 0) {
    return null;
  }

  const content = (
    <motion.div
      variants={fadeUpVariants}
      initial="initial"
      animate="animate"
      transition={motionTransition.medium}
      className="flex flex-col items-center gap-5 text-center"
    >
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-secondary" aria-hidden />
        <h3
          className={cn(
            "font-heading font-semibold",
            compact || embedded ? "text-sm sm:text-base" : "text-base sm:text-lg",
          )}
        >
          Distribution
        </h3>
      </div>

      <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-10">
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="flex items-end justify-center gap-4 sm:gap-5"
        >
          {distribution.map(({ value, count }) => {
            const barHeight = Math.max(12, (count / maxCount) * 56);

            return (
              <motion.div
                key={value}
                variants={staggerItemVariants}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="flex h-14 w-8 items-end justify-center sm:w-10"
                  aria-hidden
                >
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: barHeight, opacity: 1 }}
                    transition={{ ...motionTransition.medium, delay: 0.08 }}
                    className={cn(
                      "w-full rounded-t-md bg-gradient-to-t from-primary/30 to-secondary/50",
                      consensus && "from-primary/50 to-secondary/70",
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "flex min-w-[56px] flex-col items-center rounded-xl border-2 px-2 py-2.5 sm:min-w-[64px] sm:px-3",
                    consensus
                      ? "border-primary/60 bg-primary/15 shadow-sm shadow-primary/10"
                      : "border-border bg-card/80",
                  )}
                >
                  <span className="flex h-7 items-center justify-center text-lg font-bold text-primary sm:text-xl">
                    <VoteValueLabel value={value} />
                  </span>
                  <span className="mt-1 max-w-[88px] text-center text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">
                    {voteCountLabel(count, value)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div
          className="hidden h-20 w-px shrink-0 bg-border/80 sm:block"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionTransition.medium, delay: 0.14 }}
          className="flex flex-row items-center justify-center gap-10 sm:flex-col sm:gap-5"
        >
          {average !== null && (
            <div className="space-y-0.5 text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Average
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
                {formatAverage(average)}
              </p>
            </div>
          )}
          <div className="space-y-0.5 text-center">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              Agreement
            </p>
            <div className="flex items-center justify-center gap-2">
              {consensus ? (
                <>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-emerald-500/10 text-lg"
                    aria-hidden
                  >
                    🎉
                  </span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Consensus
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted/50"
                    aria-hidden
                  >
                    <PartyPopper className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="text-sm text-muted-foreground">Split</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  if (embedded) {
    return (
      <div aria-label="Vote distribution" className="py-1">
        {content}
      </div>
    );
  }

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="initial"
      animate="animate"
      transition={motionTransition.medium}
      aria-label="Vote distribution"
      className={cn(
        "rounded-xl border border-border bg-surface/30",
        compact ? "space-y-3 p-3 sm:p-4" : "space-y-4 bg-surface/40 p-4 sm:p-5",
      )}
    >
      {content}
    </motion.section>
  );
}
