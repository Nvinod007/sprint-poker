const STORAGE_KEY = "sprint-poker-participant";

export interface StoredParticipant {
  participantId: string;
  roomCode: string;
  displayName: string;
}

export function getStoredParticipant(
  roomCode: string,
): StoredParticipant | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredParticipant;
    if (parsed.roomCode !== roomCode.toUpperCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredParticipant(participant: StoredParticipant): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...participant,
      roomCode: participant.roomCode.toUpperCase(),
    }),
  );
}

export function clearStoredParticipant(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
