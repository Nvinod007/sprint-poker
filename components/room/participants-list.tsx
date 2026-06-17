"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Coffee,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  RefreshCw,
  Spade,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

import { ActionTooltip } from "@/components/action-tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SHORTCUTS } from "@/lib/keyboard-shortcuts";
import {
  fadeUpVariants,
  motionTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Participant, Vote, VoteValue } from "@/lib/types";

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
  revealed: boolean;
  currentParticipantId: string | null;
  facilitatorId: string | null;
  roomCode?: string;
  isHost?: boolean;
  pendingReset?: boolean;
  onNewRound?: () => void;
  nested?: boolean;
  onReveal?: () => void;
  pendingReveal?: boolean;
  showRevealAction?: boolean;
  voteStatus?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getVoteForParticipant(
  votes: Vote[],
  participantId: string,
): VoteValue | null {
  const vote = votes.find((v) => v.participant_id === participantId);
  return vote?.value ?? null;
}

function VoteValueLabel({
  value,
  className,
}: {
  value: VoteValue;
  className?: string;
}) {
  if (value === "☕") {
    return <Coffee className={cn("h-6 w-6 sm:h-7 sm:w-7", className)} aria-hidden />;
  }
  return <span className={className}>{value}</span>;
}

interface ParticipantPokerCardProps {
  participant: Participant;
  vote: VoteValue | null;
  revealed: boolean;
  isSelf: boolean;
  isHost: boolean;
}

function ParticipantPokerCard({
  participant,
  vote,
  revealed,
  isSelf,
  isHost,
}: ParticipantPokerCardProps) {
  const hasVoted = vote !== null;
  const showFront = revealed && hasVoted;
  const initials = getInitials(participant.display_name);

  return (
    <motion.li
      variants={staggerItemVariants}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={cn(
          "relative h-[104px] w-[72px] sm:h-[108px] sm:w-[80px]",
          "[perspective:800px]",
        )}
      >
        {hasVoted ? (
          <motion.div
            className="relative h-full w-full"
            initial={false}
            animate={{ rotateY: showFront ? 0 : 180 }}
            transition={motionTransition.slow}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front — vote revealed */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-between rounded-xl border-2 p-2",
                "bg-gradient-to-b from-card to-surface shadow-sm",
                isSelf
                  ? "border-primary/60 ring-1 ring-primary/30"
                  : "border-border",
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                <AvatarFallback className="text-[10px] sm:text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="flex flex-1 items-center justify-center text-2xl font-bold text-primary sm:text-3xl">
                <VoteValueLabel value={vote} />
              </span>
              <span className="h-1.5" aria-hidden />
            </div>

            {/* Back — vote hidden */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 p-2",
                "bg-gradient-to-br from-primary/20 via-surface to-secondary/10",
                isSelf
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border",
              )}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Spade
                  className="h-5 w-5 text-primary/70 sm:h-6 sm:w-6"
                  aria-hidden
                />
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-between rounded-xl border-2 border-dashed p-2",
              "border-border bg-surface/40",
              isSelf && "ring-1 ring-primary/20",
            )}
          >
            <Avatar className="h-6 w-6 opacity-50 sm:h-7 sm:w-7">
              <AvatarFallback className="text-[10px] sm:text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg font-medium text-muted-foreground">—</span>
            <span className="h-1.5" aria-hidden />
          </div>
        )}
      </div>

      <div className="w-full max-w-[88px] text-center">
        <p className="truncate text-xs font-medium sm:text-sm">
          {participant.display_name}
          {isSelf && (
            <span className="block text-[10px] font-normal text-muted-foreground sm:inline sm:ml-1">
              (you)
            </span>
          )}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1">
          {isHost && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
              Host
            </Badge>
          )}
          {!revealed && (
            <span className="text-[10px] text-muted-foreground">
              {hasVoted ? "Voted" : "Waiting…"}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}

export function ParticipantsList({
  participants,
  votes,
  revealed,
  currentParticipantId,
  facilitatorId,
  roomCode,
  isHost = false,
  pendingReset = false,
  onNewRound,
  nested = false,
  onReveal,
  pendingReveal = false,
  showRevealAction = false,
  voteStatus,
}: ParticipantsListProps) {
  const votedCount = votes.length;
  const isLonely = participants.length === 1;
  const [copied, setCopied] = useState(false);

  const copyInvite = async () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/join/${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-label={revealed ? "Results" : "Participants"}
      className={cn(
        "space-y-4",
        !nested && "rounded-2xl border border-border bg-surface/40 p-4 sm:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={revealed ? "results" : "participants"}
              variants={fadeUpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={motionTransition.fast}
              className="font-heading text-base font-semibold sm:text-lg"
            >
              {revealed ? "Results" : "Participants"}
            </motion.h2>
          </AnimatePresence>
          {!revealed && voteStatus ? (
            <p className="text-sm text-muted-foreground">{voteStatus}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showRevealAction && onReveal ? (
            <ActionTooltip label="Reveal votes" shortcut={SHORTCUTS.revealVotes} side="top">
              <Button
                onClick={onReveal}
                disabled={pendingReveal || votedCount === 0}
                className="gap-2"
                size="sm"
              >
                {pendingReveal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Reveal votes
              </Button>
            </ActionTooltip>
          ) : null}
          {!showRevealAction && !revealed && !isHost ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <EyeOff className="h-3.5 w-3.5" />
              Waiting for host
            </p>
          ) : null}
          {revealed && isHost && onNewRound ? (
            <ActionTooltip label="New round" shortcut={SHORTCUTS.newRound} side="top">
              <Button
                variant="secondary"
                size="sm"
                onClick={onNewRound}
                disabled={pendingReset}
                className="gap-2"
              >
                {pendingReset ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                New round
              </Button>
            </ActionTooltip>
          ) : null}
          {revealed && !isHost ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <EyeOff className="h-3.5 w-3.5" />
              Waiting for host
            </p>
          ) : null}
          <Badge variant="secondary">
            {votedCount}/{participants.length} voted
          </Badge>
        </div>
      </div>

      {isLonely && !revealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.medium}
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-secondary/30 bg-secondary/5 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
              <UserPlus className="h-5 w-5 text-secondary" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium">Feeling lonely? Invite players</p>
              <p className="text-xs text-muted-foreground">
                Share the room link so your team can join
              </p>
            </div>
          </div>
          {roomCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void copyInvite()}
              className="shrink-0 gap-2"
            >
              {copied ? (
                <Link2 className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy invite link"}
            </Button>
          )}
        </motion.div>
      )}

      <motion.ul
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className={cn(
          "grid justify-items-center gap-x-3 gap-y-5",
          "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
        )}
      >
        {participants.map((participant) => (
          <ParticipantPokerCard
            key={participant.id}
            participant={participant}
            vote={getVoteForParticipant(votes, participant.id)}
            revealed={revealed}
            isSelf={participant.id === currentParticipantId}
            isHost={participant.id === facilitatorId}
          />
        ))}
      </motion.ul>
    </section>
  );
}
