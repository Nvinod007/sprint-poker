export type VoteValue = "1" | "2" | "3" | "5" | "8" | "13" | "21" | "?" | "☕";

export const FIBONACCI_VALUES: VoteValue[] = [
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "?",
  "☕",
];

export interface Room {
  id: string;
  code: string;
  name: string | null;
  story_title: string | null;
  revealed: boolean;
  facilitator_id: string | null;
  created_at?: string;
}

export interface Participant {
  id: string;
  room_id: string;
  display_name: string;
  created_at?: string;
}

export interface Vote {
  id: string;
  room_id: string;
  participant_id: string;
  value: VoteValue;
  created_at?: string;
}

export interface RoomState {
  room: Room | null;
  participants: Participant[];
  votes: Vote[];
  loading: boolean;
  error: string | null;
}
