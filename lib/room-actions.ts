import { supabase } from "@/lib/supabase/client";
import type { VoteValue } from "@/lib/types";
import { normalizeRoomCode } from "@/lib/room-code";
import { generateJoinCode } from "@/lib/room-names";

async function assertFacilitator(roomId: string, participantId: string) {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("facilitator_id")
    .eq("id", roomId)
    .single();

  if (error) throw error;
  if (!room.facilitator_id) {
    throw new Error("This room has no host assigned");
  }
  if (room.facilitator_id !== participantId) {
    throw new Error("Only the host can perform this action");
  }
}

export async function createRoom(displayName: string) {
  const name = displayName.trim();
  if (!name) throw new Error("Display name is required");

  let code = generateJoinCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        code,
        name: null,
        story_title: null,
        revealed: false,
      })
      .select()
      .single();

    if (!roomError && room) {
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({ room_id: room.id, display_name: name })
        .select()
        .single();

      if (participantError) throw participantError;

      const { error: facilitatorError } = await supabase
        .from("rooms")
        .update({ facilitator_id: participant.id })
        .eq("id", room.id);

      if (facilitatorError) throw facilitatorError;

      return {
        room: { ...room, facilitator_id: participant.id },
        participant,
      };
    }

    if (roomError?.code === "23505") {
      code = generateJoinCode();
      attempts++;
      continue;
    }

    throw roomError ?? new Error("Failed to create room");
  }

  throw new Error("Could not generate a unique room code");
}

export async function joinRoom(code: string, displayName: string) {
  const normalized = normalizeRoomCode(code);
  const name = displayName.trim();
  if (!name) throw new Error("Display name is required");

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select()
    .eq("code", normalized)
    .single();

  if (roomError || !room) throw new Error("Room not valid");

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({ room_id: room.id, display_name: name })
    .select()
    .single();

  if (participantError) throw participantError;
  return { room, participant };
}

export async function validateRoomExists(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", normalizeRoomCode(code))
    .maybeSingle();

  return !error && data !== null;
}

export async function validateParticipantInRoom(
  code: string,
  participantId: string,
): Promise<{ displayName: string } | null> {
  const normalized = normalizeRoomCode(code);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", normalized)
    .maybeSingle();

  if (roomError || !room) return null;

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("display_name")
    .eq("id", participantId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (participantError || !participant) return null;

  return { displayName: participant.display_name };
}

export async function fetchRoomByCode(code: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("code", normalizeRoomCode(code))
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRoomState(roomId: string) {
  const [roomRes, participantsRes, votesRes] = await Promise.all([
    supabase.from("rooms").select().eq("id", roomId).single(),
    supabase
      .from("participants")
      .select()
      .eq("room_id", roomId)
      .order("created_at", { ascending: true }),
    supabase.from("votes").select().eq("room_id", roomId),
  ]);

  if (roomRes.error) throw roomRes.error;
  if (participantsRes.error) throw participantsRes.error;
  if (votesRes.error) throw votesRes.error;

  return {
    room: roomRes.data,
    participants: participantsRes.data ?? [],
    votes: votesRes.data ?? [],
  };
}

export async function updateStoryTitle(
  roomId: string,
  participantId: string,
  storyTitle: string,
) {
  await assertFacilitator(roomId, participantId);

  const title = storyTitle.trim();
  const { error } = await supabase
    .from("rooms")
    .update({ story_title: title || null })
    .eq("id", roomId);

  if (error) throw error;
}

export async function updateRoomName(
  roomId: string,
  participantId: string,
  roomName: string,
) {
  await assertFacilitator(roomId, participantId);

  const name = roomName.trim();

  const { error } = await supabase
    .from("rooms")
    .update({ name: name || null })
    .eq("id", roomId);

  if (error) throw error;
}

export async function castVote(
  roomId: string,
  participantId: string,
  value: VoteValue,
) {
  const { error } = await supabase.from("votes").upsert(
    { room_id: roomId, participant_id: participantId, value },
    { onConflict: "room_id,participant_id" },
  );

  if (error) throw error;
}

export async function leaveRoom(participantId: string, roomId: string) {
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("facilitator_id")
    .eq("id", roomId)
    .single();

  if (roomError) throw roomError;

  const wasHost = room.facilitator_id === participantId;

  const { data: others, error: othersError } = await supabase
    .from("participants")
    .select("id")
    .eq("room_id", roomId)
    .neq("id", participantId)
    .order("created_at", { ascending: true });

  if (othersError) throw othersError;

  const { error: deleteError } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("room_id", roomId);

  if (deleteError) throw deleteError;

  if (!others?.length) {
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);
    if (error) throw error;
    return;
  }

  if (wasHost) {
    const { error } = await supabase
      .from("rooms")
      .update({ facilitator_id: others[0].id })
      .eq("id", roomId);

    if (error) throw error;
  }
}

export async function revealVotes(roomId: string, participantId: string) {
  await assertFacilitator(roomId, participantId);

  const { error } = await supabase
    .from("rooms")
    .update({ revealed: true })
    .eq("id", roomId);

  if (error) throw error;
}

export async function resetRound(roomId: string, participantId: string) {
  await assertFacilitator(roomId, participantId);

  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("room_id", roomId);

  if (deleteError) throw deleteError;

  const { error: roomError } = await supabase
    .from("rooms")
    .update({ revealed: false })
    .eq("id", roomId);

  if (roomError) throw roomError;
}
