"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { RoomView } from "@/components/room/room-view";
import { getStoredParticipant, setStoredParticipant } from "@/lib/participant-storage";
import { validateParticipantInRoom } from "@/lib/room-actions";
import { normalizeRoomCode } from "@/lib/room-code";
import { buildRoomPath } from "@/lib/room-url";

interface RoomPageClientProps {
  code: string;
}

type SessionState =
  | { status: "loading" }
  | { status: "ready"; participantId: string }
  | { status: "redirect" };

export function RoomPageClient({ code }: RoomPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = normalizeRoomCode(code);
  const urlParticipantId = searchParams.get("p");

  const [session, setSession] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (urlParticipantId) {
        try {
          const result = await validateParticipantInRoom(
            roomCode,
            urlParticipantId,
          );
          if (cancelled) return;

          if (result) {
            setStoredParticipant({
              participantId: urlParticipantId,
              roomCode,
              displayName: result.displayName,
            });
            setSession({ status: "ready", participantId: urlParticipantId });
            router.replace(buildRoomPath(roomCode, urlParticipantId));
            return;
          }

          router.replace(`/join/${roomCode}`);
          setSession({ status: "redirect" });
          return;
        } catch {
          if (cancelled) return;
          router.replace(`/join/${roomCode}`);
          setSession({ status: "redirect" });
          return;
        }
      }

      const stored = getStoredParticipant(roomCode);
      if (stored) {
        setSession({ status: "ready", participantId: stored.participantId });
        router.replace(buildRoomPath(roomCode, stored.participantId));
        return;
      }

      router.replace(`/join/${roomCode}`);
      setSession({ status: "redirect" });
    })();

    return () => {
      cancelled = true;
    };
  }, [roomCode, router, urlParticipantId]);

  if (session.status !== "ready") {
    return (
      <PageTransition className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </PageTransition>
    );
  }

  return (
    <RoomView roomCode={roomCode} participantId={session.participantId} />
  );
}
