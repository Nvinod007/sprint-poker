"use client";

import { Copy, Link2, Loader2, LogOut, Share2, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { ActionTooltip } from "@/components/action-tooltip";
import { PageTransition } from "@/components/page-transition";
import { ParticipantsList } from "@/components/room/participants-list";
import {
  RoomNameEditor,
  type RoomNameEditorHandle,
} from "@/components/room/room-name-editor";
import {
  StoryTitleEditor,
  type StoryTitleEditorHandle,
} from "@/components/room/story-title-editor";
import { VoteCards } from "@/components/room/vote-cards";
import { VoteRevealSummary } from "@/components/room/vote-reveal-summary";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoomKeyboard } from "@/hooks/use-room-keyboard";
import { useRoom } from "@/hooks/use-room";
import { SHORTCUTS } from "@/lib/keyboard-shortcuts";
import { clearStoredParticipant } from "@/lib/participant-storage";
import { fireRevealConfetti } from "@/lib/celebrate-reveal";
import { fadeUpVariants, motionTransition } from "@/lib/motion";
import { leaveRoom } from "@/lib/room-actions";
import { hasNumericConsensus } from "@/lib/vote-stats";
import type { VoteValue } from "@/lib/types";

interface RoomViewProps {
  roomCode: string;
  participantId: string;
}

export function RoomView({ roomCode, participantId }: RoomViewProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const storyEditorRef = useRef<StoryTitleEditorHandle>(null);
  const roomNameEditorRef = useRef<RoomNameEditorHandle>(null);
  const [roomResolve, setRoomResolve] = useState<{
    code: string;
    roomId: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roomId = roomResolve?.code === roomCode ? roomResolve.roomId : null;
  const resolvingRoom = roomResolve?.code !== roomCode;

  const {
    room,
    participants,
    votes,
    loading,
    error,
    pending,
    castVote,
    revealVotes,
    resetRound,
    updateStoryTitle,
    updateRoomName,
  } = useRoom({
    roomId,
    enabled: !!roomId,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { fetchRoomByCode } = await import("@/lib/room-actions");
      try {
        const data = await fetchRoomByCode(roomCode);
        if (!cancelled) {
          setRoomResolve({ code: roomCode, roomId: data.id });
        }
      } catch {
        if (!cancelled) router.push("/");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomCode, router]);

  const myVote = useMemo(
    () => votes.find((v) => v.participant_id === participantId)?.value ?? null,
    [votes, participantId],
  );

  const revealed = room?.revealed ?? false;
  const prevRevealedRef = useRef(revealed);
  useEffect(() => {
    if (!prevRevealedRef.current && revealed) {
      fireRevealConfetti(hasNumericConsensus(votes));
    }
    prevRevealedRef.current = revealed;
  }, [revealed, votes]);

  const isHost = room?.facilitator_id === participantId;
  const votedCount = votes.length;
  const totalCount = participants.length;

  const handleVote = async (value: VoteValue) => {
    if (!room || revealed) return;
    setActionError(null);
    try {
      await castVote(participantId, value);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  const handleReveal = async () => {
    if (!room) return;
    setActionError(null);
    try {
      await revealVotes(participantId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reveal");
    }
  };

  const handleReset = async () => {
    if (!room) return;
    setActionError(null);
    try {
      await resetRound(participantId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reset");
    }
  };

  const handleSaveTitle = async (title: string) => {
    if (!room) return;
    setActionError(null);
    try {
      await updateStoryTitle(participantId, title);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save story",
      );
      throw err;
    }
  };

  const handleSaveRoomName = async (name: string) => {
    if (!room) return;
    setActionError(null);
    try {
      await updateRoomName(participantId, name);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save room name",
      );
      throw err;
    }
  };

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/join/${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomCode]);

  const shareLink = useCallback(async () => {
    const url = `${window.location.origin}/join/${roomCode}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Join my Sprint Poker room",
          url,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    await copyLink();
  }, [roomCode, copyLink]);

  const handleLeave = useCallback(async () => {
    clearStoredParticipant();
    if (room) {
      try {
        await leaveRoom(participantId, room.id);
      } catch {
        /* navigate even if delete fails */
      }
    }
    router.push("/");
  }, [room, participantId, router]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useRoomKeyboard({
    enabled: !!room && !loading,
    revealed,
    isHost,
    canVote: !!room && !revealed,
    onCopyLink: () => void copyLink(),
    onShare: () => void shareLink(),
    onLeave: handleLeave,
    onToggleTheme: toggleTheme,
    onReveal: () => {
      if (votedCount > 0) void handleReveal();
    },
    onNewRound: () => void handleReset(),
    onEditStory: () => storyEditorRef.current?.startEdit(),
    onEditRoomName: () => roomNameEditorRef.current?.startEdit(),
    onVote: (value) => void handleVote(value),
  });

  if (resolvingRoom || !roomId || (loading && !room)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">{error ?? "Room not found"}</p>
        <Button onClick={() => router.push("/")}>Back home</Button>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Sprint Poker
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Room code:{" "}
                <span className="font-mono font-medium text-foreground">
                  {roomCode}
                </span>
              </p>
              <RoomNameEditor
                ref={roomNameEditorRef}
                room={room}
                onSave={handleSaveRoomName}
                disabled={!isHost}
                saving={pending.roomName}
              />
              <Badge variant={revealed ? "success" : "muted"}>
                {revealed ? "Revealed" : "Voting"}
              </Badge>
            </div>
            {room.name?.trim() ?
              <p className="mt-1 text-xs text-muted-foreground">
                {room.name.trim()}
              </p>
            : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ActionTooltip
              label="Copy invite link"
              shortcut={SHORTCUTS.copyLink}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void copyLink()}
                aria-label="Copy invite link"
              >
                {copied ?
                  <Link2 className="h-4 w-4 text-primary" />
                : <Copy className="h-4 w-4" />}
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Share room" shortcut={SHORTCUTS.shareRoom}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void shareLink()}
                aria-label="Share room"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Leave room" shortcut={SHORTCUTS.leaveRoom}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeave}
                aria-label="Leave room"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </ActionTooltip>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 lg:gap-6">
          <StoryTitleEditor
            ref={storyEditorRef}
            title={room.story_title}
            onSave={handleSaveTitle}
            disabled={!isHost}
            saving={pending.storyTitle}
          />

          <section className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/40">
            {/* Top: participants while voting → results when revealed */}
            <motion.div
              layout={false}
              className="p-4 sm:p-6"
              initial={false}
              animate={{ opacity: 1 }}
              transition={motionTransition.fast}
            >
              <ParticipantsList
                nested
                participants={participants}
                votes={votes}
                revealed={revealed}
                currentParticipantId={participantId}
                facilitatorId={room.facilitator_id}
                roomCode={revealed ? undefined : roomCode}
                isHost={isHost}
                pendingReset={pending.reset}
                pendingReveal={pending.reveal}
                showRevealAction={!revealed && isHost}
                voteStatus={
                  !revealed ? `${votedCount}/${totalCount} voted` : undefined
                }
                onReveal={
                  !revealed && isHost ? () => void handleReveal() : undefined
                }
                onNewRound={
                  revealed && isHost ? () => void handleReset() : undefined
                }
              />
            </motion.div>

            {/* Bottom: your vote while voting → distribution when revealed */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                {!revealed ?
                  <motion.div
                    key="your-vote"
                    variants={fadeUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={motionTransition.medium}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="font-heading text-base font-semibold sm:text-lg">
                        Your vote
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Pick a card — hidden until reveal
                      </p>
                    </div>

                    <VoteCards
                      selected={myVote}
                      onSelect={(v) => void handleVote(v)}
                      disabled={false}
                    />
                  </motion.div>
                : <motion.div
                    key="distribution"
                    variants={fadeUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={motionTransition.medium}
                  >
                    <VoteRevealSummary
                      embedded
                      votes={votes}
                      revealed={revealed}
                    />
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </section>

          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
        </main>

        <footer className="mt-8 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""} in room
          </span>
        </footer>
      </div>
    </PageTransition>
  );
}
