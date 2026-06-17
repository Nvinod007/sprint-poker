"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  castVote as castVoteAction,
  fetchRoomState,
  revealVotes as revealVotesAction,
  resetRound as resetRoundAction,
  updateRoomName as updateRoomNameAction,
  updateStoryTitle as updateStoryTitleAction,
} from "@/lib/room-actions";
import { supabase } from "@/lib/supabase/client";
import type { Participant, Room, Vote, VoteValue } from "@/lib/types";

interface UseRoomOptions {
  roomId: string | null;
  enabled?: boolean;
}

type RoomOverride = Partial<Pick<Room, "revealed" | "story_title" | "name">>;

interface OptimisticOverride {
  room?: RoomOverride;
  votes?: Vote[];
}

function upsertVote(
  votes: Vote[],
  roomId: string,
  participantId: string,
  value: VoteValue,
): Vote[] {
  const existing = votes.find((v) => v.participant_id === participantId);
  if (existing) {
    return votes.map((v) =>
      v.participant_id === participantId ? { ...v, value } : v,
    );
  }
  return [
    ...votes,
    {
      id: `optimistic-${participantId}`,
      room_id: roomId,
      participant_id: participantId,
      value,
    },
  ];
}

export function useRoom({ roomId, enabled = true }: UseRoomOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState<OptimisticOverride>({});
  const [pending, setPending] = useState({
    vote: false,
    reveal: false,
    reset: false,
    storyTitle: false,
    roomName: false,
  });

  const activeMutations = useRef(0);
  const votesRef = useRef<Vote[]>([]);
  votesRef.current = override.votes ?? votes;

  const refresh = useCallback(async () => {
    if (!roomId) return;

    try {
      const state = await fetchRoomState(roomId);
      setRoom(state.room);
      setParticipants(state.participants);
      setVotes(state.votes);
      setError(null);
      if (activeMutations.current === 0) {
        setOverride({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const runMutation = useCallback(
    async <T>(
      key: keyof typeof pending | null,
      optimistic: OptimisticOverride,
      action: () => Promise<T>,
    ): Promise<T> => {
      activeMutations.current += 1;
      if (key) setPending((p) => ({ ...p, [key]: true }));
      setOverride((prev) => ({
        room: { ...prev.room, ...optimistic.room },
        votes: optimistic.votes ?? prev.votes,
      }));

      try {
        const result = await action();
        await refresh();
        return result;
      } catch (err) {
        if (activeMutations.current === 1) {
          setOverride({});
        }
        throw err;
      } finally {
        activeMutations.current -= 1;
        if (key) setPending((p) => ({ ...p, [key]: false }));
        if (activeMutations.current === 0) {
          setOverride({});
        }
      }
    },
    [refresh],
  );

  const castVote = useCallback(
    async (participantId: string, value: VoteValue) => {
      if (!roomId) return;
      const nextVotes = upsertVote(
        votesRef.current,
        roomId,
        participantId,
        value,
      );
      await runMutation(
        null,
        { votes: nextVotes },
        () => castVoteAction(roomId, participantId, value),
      );
    },
    [roomId, runMutation],
  );

  const revealVotes = useCallback(
    async (participantId: string) => {
      if (!roomId) return;
      await runMutation(
        "reveal",
        { room: { revealed: true } },
        () => revealVotesAction(roomId, participantId),
      );
    },
    [roomId, runMutation],
  );

  const resetRound = useCallback(
    async (participantId: string) => {
      if (!roomId) return;
      await runMutation(
        "reset",
        { room: { revealed: false }, votes: [] },
        () => resetRoundAction(roomId, participantId),
      );
    },
    [roomId, runMutation],
  );

  const updateStoryTitle = useCallback(
    async (participantId: string, title: string) => {
      if (!roomId) return;
      const trimmed = title.trim();
      await runMutation(
        "storyTitle",
        { room: { story_title: trimmed || null } },
        () => updateStoryTitleAction(roomId, participantId, title),
      );
    },
    [roomId, runMutation],
  );

  const updateRoomName = useCallback(
    async (participantId: string, name: string) => {
      if (!roomId) return;
      await runMutation(
        "roomName",
        { room: { name: name || null } },
        () => updateRoomNameAction(roomId, participantId, name),
      );
    },
    [roomId, runMutation],
  );

  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    setLoading(true);
    void refresh();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `room_id=eq.${roomId}`,
        },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, enabled, refresh]);

  const mergedRoom = useMemo(() => {
    if (!room) return null;
    if (!override.room) return room;
    return { ...room, ...override.room };
  }, [room, override.room]);

  const mergedVotes = override.votes ?? votes;

  return {
    room: mergedRoom,
    participants,
    votes: mergedVotes,
    loading,
    error,
    pending,
    refresh,
    castVote,
    revealVotes,
    resetRound,
    updateStoryTitle,
    updateRoomName,
  };
}
