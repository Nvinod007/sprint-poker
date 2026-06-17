"use client";

import { ArrowLeft, CirclePlus, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStoredParticipant, setStoredParticipant } from "@/lib/participant-storage";
import { joinRoom, validateRoomExists } from "@/lib/room-actions";
import { normalizeRoomCode } from "@/lib/room-code";
import { buildRoomPath } from "@/lib/room-url";

interface JoinRoomFormProps {
  code: string;
}

export function JoinRoomForm({ code }: JoinRoomFormProps) {
  const router = useRouter();
  const roomCode = normalizeRoomCode(code);

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(true);
  const [roomValid, setRoomValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = getStoredParticipant(roomCode);
      if (stored) {
        router.replace(buildRoomPath(roomCode, stored.participantId));
        return;
      }

      try {
        const exists = await validateRoomExists(roomCode);
        setRoomValid(exists);
      } catch {
        setRoomValid(false);
      } finally {
        setCheckingRoom(false);
      }
    })();
  }, [roomCode, router]);

  const handleJoin = async () => {
    const name = displayName.trim();
    if (!name) {
      setError("Enter your display name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { room, participant } = await joinRoom(roomCode, name);
      setStoredParticipant({
        participantId: participant.id,
        roomCode: room.code,
        displayName: name,
      });
      router.push(buildRoomPath(room.code, participant.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  if (checkingRoom) {
    return (
      <PageTransition className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </PageTransition>
    );
  }

  if (!roomValid) {
    return (
      <PageTransition className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
          <header className="mb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <ThemeToggle />
          </header>

          <main className="flex flex-1 flex-col justify-center pb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room not valid</CardTitle>
                <CardDescription>
                  No room exists with code{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {roomCode}
                  </span>
                  . Check the code or create a new room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" onClick={() => router.push("/")}>
                  <CirclePlus className="h-4 w-4" />
                  Create a Room
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
        <header className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 flex-col justify-center pb-12">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Join Room</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your name to join room{" "}
              <span className="font-mono font-semibold text-foreground">
                {roomCode}
              </span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your name</CardTitle>
              <CardDescription>
                This is how others will see you in the room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleJoin()}
                autoFocus
                aria-label="Display name"
              />
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => void handleJoin()}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Join Room
              </Button>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
}
