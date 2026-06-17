import { normalizeRoomCode } from "@/lib/room-code";

export function buildRoomPath(
  roomCode: string,
  participantId?: string,
): string {
  const code = normalizeRoomCode(roomCode);
  if (participantId) {
    return `/room/${code}?p=${participantId}`;
  }
  return `/room/${code}`;
}
