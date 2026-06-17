"use client";

import { useEffect } from "react";

import {
  isEditableTarget,
  matchShortcut,
  SHORTCUTS,
  voteFromKeyboardKey,
} from "@/lib/keyboard-shortcuts";
import type { VoteValue } from "@/lib/types";

interface UseRoomKeyboardOptions {
  enabled: boolean;
  revealed: boolean;
  isHost: boolean;
  canVote: boolean;
  onCopyLink: () => void;
  onShare: () => void;
  onLeave: () => void;
  onToggleTheme: () => void;
  onReveal: () => void;
  onNewRound: () => void;
  onEditStory: () => void;
  onEditRoomName: () => void;
  onVote: (value: VoteValue) => void;
}

export function useRoomKeyboard({
  enabled,
  revealed,
  isHost,
  canVote,
  onCopyLink,
  onShare,
  onLeave,
  onToggleTheme,
  onReveal,
  onNewRound,
  onEditStory,
  onEditRoomName,
  onVote,
}: UseRoomKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (matchShortcut(event, SHORTCUTS.copyLink)) {
        event.preventDefault();
        onCopyLink();
        return;
      }
      if (matchShortcut(event, SHORTCUTS.shareRoom)) {
        event.preventDefault();
        onShare();
        return;
      }
      if (matchShortcut(event, SHORTCUTS.leaveRoom)) {
        event.preventDefault();
        onLeave();
        return;
      }
      if (matchShortcut(event, SHORTCUTS.toggleTheme)) {
        event.preventDefault();
        onToggleTheme();
        return;
      }
      if (matchShortcut(event, SHORTCUTS.editStory) && isHost) {
        event.preventDefault();
        onEditStory();
        return;
      }
      if (matchShortcut(event, SHORTCUTS.editRoomName) && isHost) {
        event.preventDefault();
        onEditRoomName();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (isHost && !revealed && event.key.toLowerCase() === "r") {
        event.preventDefault();
        onReveal();
        return;
      }
      if (isHost && revealed && event.key.toLowerCase() === "n") {
        event.preventDefault();
        onNewRound();
        return;
      }

      if (canVote) {
        const vote = voteFromKeyboardKey(event.key);
        if (vote) {
          event.preventDefault();
          onVote(vote);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    revealed,
    isHost,
    canVote,
    onCopyLink,
    onShare,
    onLeave,
    onToggleTheme,
    onReveal,
    onNewRound,
    onEditStory,
    onEditRoomName,
    onVote,
  ]);
}
